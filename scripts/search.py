from indextank.client import ApiClient

# fields : uuid,name,address,city,state,postcode,telephone,fax,category,website,latitude,longitude

api = ApiClient('http://:7MQ8kMr0p4zAXb@8ai5u.api.indextank.com')
index = api.get_index('boston_and_cambridge')

results = index.search('5a17e555-7da7-4052-8e7c-e1e3a4085435', fetch_fields = ['name', 'address', 'city', 'state'])

bss = results['results']

print results

for bs in bss:
    print "%(name)s : %(address)s, %(city)s, %(state)s" % bs

