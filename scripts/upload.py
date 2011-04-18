import csv

from indextank.client import ApiClient

reader = csv.DictReader(open('US_POI_and_Business_Listings_(Beta).csv'),
                        delimiter = ',')

api = ApiClient('http://:indextank-api-key')
index = api.get_index('index-name')

categories = set()
total = 0
valid = 0

bss = {}

for business in reader:
    if(business['state'] == 'MA'):# and
        total += 1
        if(business['longitude'] != '' and business['latitude'] != '' and business['category'] != ''):
            categories.add(business['category'])
            bss[business['uuid']] = business
            valid += 1

print "Categories:", len(categories)
print "Total:", total
print "Valid:", valid
print "Accepted percentage:", "%.2f" % ((100.0 * valid) / total)


i = 0

documents = []

bus = bss.items()

for uid,bs in bus:
    vars = { 0 : bs['latitude'], 1 : bs['longitude'] }
    documents.append({'docid' : uid, 'fields' : bs, 'variables' : vars})
    if ((i % 200) == 0) or (len(bus) - i < 200):
        print "Uploading: %d" % i
        response = index.add_documents(documents)
        print response
        documents = []
    i += 1

