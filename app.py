import webapp2


class MainPage(webapp2.RequestHandler):

    def get(self):
        self.response.headers['Content-Type'] = 'text/html'
        self.response.write('<meta HTTP-EQUIV="REFRESH" content="0; url=html/TouchType.html">')


application = webapp2.WSGIApplication([
    ('/', MainPage),
], debug=True)