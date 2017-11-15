# !/usr/bin/env python

from pprint import pprint
from tornado.ioloop import IOLoop
from tornado.web import RequestHandler, Application, StaticFileHandler
from tornado.httpclient import HTTPClient
from urllib.parse import quote_plus
import dailymotion
import json
from os import path



class IndexHandler(RequestHandler):
    # The Index HTML Handler
    def get(self):
        self.finish(open('Templates/index.html').read())


class StaticHandler(RequestHandler):
    # The Handler that will return the javascript for our site
    def get(self):
        self.finish(open('Erelak.js').read())


class APIHandler(RequestHandler): 

    def get(self):
        req = self.get_argument('q', None)  # 'q' holds the text, refer n. 1 in Erelak.js
        if not req:
            self.set_status(400)
            self.finish('You did not specify the parameter q')
            return

        # VIMEO API
        client = HTTPClient()  # it sends the http request
        url_vimeo = 'https://api.vimeo.com/videos?query={}&per_page=25'  # url for api (https://vimeo.com/search?q=bob)
        url_vimeo = url_vimeo.format(quote_plus(req))

        resp_vimeo = client.fetch(url_vimeo, headers={
            'Authorization': 'Bearer ********************************' # You need to ger your own bearer number (see Documentation)

        }) # Authorization for using API
        content_vimeo = json.loads(resp_vimeo.body.decode('utf8'))
        response_vimeo = []
        data_vimeo = content_vimeo['data']
        for item_vimeo in data_vimeo:
            url_api = item_vimeo['link']
            # pprint(url_api)  # It prints the code in a clean way
            response_vimeo.append({
                'name': item_vimeo['name'],
                'link': item_vimeo['link'],
                'thumbnails': item_vimeo['pictures']['sizes'],
                'views': item_vimeo['stats']['plays'],
                'username': item_vimeo['user']['name'],
                'userlink': item_vimeo['user']['link']
            })

        # DAILYMOTION API
        d = dailymotion.Dailymotion()  # For Dailymotion is not necessary to make an autenticated call
        content_dailymotion = d.get('/videos', {'fields': 'title,url,thumbnail_url,'
                                                          'owner.screenname,'
                                                          'owner.url,'
                                                          'views_total', 'search': req, 'limit': 25})
        self.finish({
            'response_vimeo': response_vimeo,
            'response_dailymotion': content_dailymotion
        })



handlers = [
    (r'/', IndexHandler,),
    (r'/URLsearch', APIHandler),
    (r'/static/(.*)', StaticFileHandler, {'path': path.join(path.dirname(__file__), 'static')})
]


def main():
    # Entry point for the file
    app = Application(handlers, debug=True)  # A collection of request handlers that make up a web application.
    port = 8085
    app.listen(port)  # to make the connection to the socket

    print('\nServer running with port {}, press ctrl + c to quit'.format(port))
    print('To display the page, open your web browser and type: localhost:{}'.format(port))
    IOLoop.current().start()

if __name__ == '__main__':
        main()



