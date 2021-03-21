from csv import reader

bydate = {}
totalpop = {}

with open('co-est2019-alldata.csv', 'r') as f:
    csv = reader(f)
    for row in csv:
        fips = '%s%s' % (row[3].zfill(2), row[4].zfill(3))
        totalpop[fips] = int(row[18])

fipslast = {}

newyork = ['36005', '36047', '36061', '36081', '36085']
hoonah = ['02105', '02282']
bristol = ['02282', '02060']

with open('us-counties.csv', 'r') as f:
    csv = reader(f)
    
    for row in csv:
        date, county, state, fips, cases, deaths = row

        if not date: continue
         
        if county == 'New York City':
            fips = '00000'
        if county == 'Yakutat plus Hoonah-Angoon':
            fips = '11111'
        if county == 'Bristol Bay plus Lake and Peninsula':
            fips = '22222'

        if not fips: continue

        if date not in bydate:
            bydate[date] = {}
        if fips not in bydate[date]:
            total = 0
            if fips in totalpop:
                total = totalpop[fips]
            if fips == '00000':
                total = sum([totalpop[x] for x in newyork])
            if fips == '11111':
                total = sum([totalpop[x] for x in hoonah])
            if fips == '22222':
                total = sum([totalpop[x] for x in bristol])
            bydate[date][fips] = { 'pop': total, 'cases': 0 }
        if fips not in fipslast:
            fipslast[fips] = 0
            
        _cases = int(cases or 0)
        bydate[date][fips]['cases'] = _cases - fipslast[fips]

        if _cases > 0:
            fipslast[fips] = _cases

print 'const casesbydate = %s\nexport default casesbydate' % bydate

