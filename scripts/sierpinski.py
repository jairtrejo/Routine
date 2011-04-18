# sierpinski.py - A traveler salesman problem solver.

class Sierpinski(object):

    def __init__(self, fname):
        sfile = open(fname, 'r')
        self.curve = [int(p) for p in sfile.read().split('\n') if p != '']
        self.points = []

    def add_point(self, point):
        self.points.append(point)

    def reset(self):
        self.points = []

    def shortest_route(self):
        minx = self.points[0]['lng']
        maxx = self.points[0]['lng']
        miny = self.points[0]['lat']
        maxy = self.points[0]['lat']
        for o in self.points:
            if(o['lng'] < minx): minx = o['lng']
            if(o['lng'] > maxx): maxx = o['lng']
            if(o['lat'] < miny): miny = o['lng']
            if(o['lat'] > maxy): maxy = o['lng']
        width = maxx - minx
        height = maxy - miny
        def scale(p):
            x = (1000.0 * (p['lng'] - minx)) / width if width > 0 else 500
            y = (1000.0 * (p['lat'] - miny)) / height if height > 0 else 500
            return (x,y)

        def point2cell(p):
            x = int(p[0]) / 10
            y = int(p[1]) / 10
            return y * 100 + x

        self.points.sort(key = lambda o : point2cell(scale(o)))
        return self.points

