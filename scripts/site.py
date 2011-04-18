import json

import cherrypy

from indextank.client import ApiClient
from sierpinski import Sierpinski

# fields : uuid,name,address,city,state,postcode,telephone,fax,category,website,latitude,longitude

class RoutineBackend(object):

    def __init__(self):
        self.api = ApiClient('http://:7MQ8kMr0p4zAXb@8ai5u.api.indextank.com')
        self.index = self.api.get_index('businesses')
        self.sierpinski = Sierpinski('co.txt')

    @cherrypy.expose
    def index(self, _):
        return "show_search('Hello World!')"

    @cherrypy.expose
    def sort(self, lathome, lnghome, stops, cback, _=''):
        cherrypy.response.headers['Content-Type'] = 'application/javascript'
        st = stops.split(',')

        home = {'lat' : float(lathome),
                'lng' : float(lnghome),
                'uid' : 0,
                'bubble' : 'home'}

        query = 'uuid:'
        bubble_template = """<h3>%(name)s</h3>
                             <p>%(address)s, %(city)s, %(state)s</p>"""

        self.sierpinski.reset()
        self.sierpinski.add_point(home)

        for stop in st:
            re = self.index.search(query + stop,
                                   fetch_fields = ['name', 'address', 'city', 'state', 'telephone', 'website',
                                                   'latitude', 'longitude', 'docid'])['results'][0]

            bs = {}
            re['name'] = re['name'].replace("'", "")
            bs['bubble'] = bubble_template % re
            if re['telephone'] != '' :
                bs['bubble'] += '<p>Telephone: ' + re['telephone'] + '</p>'
            if re['website'] != '' :
                bs['bubble'] += '<p>Website: <a href="' + re['website'] + '" target="_blank">' + re['website'] + '</a></p>'
            bs['lat'] = float(re['latitude'])
            bs['lng'] = float(re['longitude'])
            bs['uid'] = re['docid']
            self.sierpinski.add_point(bs)

        data = {'bss' : self.sierpinski.shortest_route()}
        return cback + "(" + json.dumps(data) + ");"

    @cherrypy.expose
    def search(self, nameortype, address, lat, lng, cback, _=''):
        cherrypy.response.headers['Content-Type'] = 'application/javascript'
        if(nameortype == '' and address == ''):
            return cback + '(' + json.dumps({'bss' : []}) + ');'

        query = 'name:"' + nameortype + '" OR category:"' + nameortype + '"'
        if(address): query = '( ' + query + ' ) AND ( address:"' + address + '" OR city:"' + address + '" )'
        #self.index.add_function(1, '-miles(query.var[0], query.var[1], doc.var[0], doc.var[1])')
        results = self.index.search(query,
                                    fetch_fields = ['name', 'address', 'city', 'state', 'latitude', 'longitude', 'docid'],
                                    variables = {0:float(lat), 1:float(lng)},
                                    scoring_function = 1)

        bss = results['results']

        resp = []

        binfo_template = """<h3>%(name)s</h3>
                            <p>%(address)s, %(city)s, %(state)s</p>"""


        bubble_template = binfo_template
        bubble_template += """<p class='align-right'>
                                 (<a href='javascript:add_stop("%(docid)s", " """ + binfo_template + """ ");'>Add stop</a>)
                              </p>"""

        for bs in bss:
            bs['name'] = bs['name'].replace("'", "")
            bsjs = {}
            bsjs['bubble'] = bubble_template % bs
            bsjs['lat'] = bs['latitude']
            bsjs['lng'] = bs['longitude']
            bsjs['uid'] = bs['docid']
            resp.append(bsjs)

        return cback + '(' + json.dumps({'bss' : resp}) + ');'

cherrypy.config.update({
    'environment' : 'production',
    'log.screen' : False,
    'server.socket_host' : '127.0.0.1',
    'server.socket_port' : 36308
});

cherrypy.quickstart(RoutineBackend())
