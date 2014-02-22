#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
from google.appengine.api import users
    
import webapp2
import json

class MainHandler(webapp2.RequestHandler):
    def get(self):
        text = 'Hi there<br />'
        if 1:
            req = self.request
            
            for attr in dir(req):
                if attr.startswith('_'): 
                    continue
                text += attr
                text += ' = '
                try: 
                    text += str(getattr(req, attr))
                except: 
                    text += 'NA'
                text += '<br />\n'
        self.response.write(text)

class UserHandler(webapp2.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            self.response.headers['Content-Type'] = 'text/plain'
            #self.response.write('Hello, ' + user.nickname())
            obj = {
                'user': user.nickname()
                , 'id': user.user_id()}
            text = json.dumps(obj, indent=1, sort_keys=False)
            self.response.write(text)
        else:
            self.redirect(users.create_login_url(self.request.uri))

        
app = webapp2.WSGIApplication([
    ('/', MainHandler),
    ('/user/*.*', UserHandler),
    ('/*.*', MainHandler),
], debug=True)
