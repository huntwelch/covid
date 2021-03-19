from csv import reader

usage = {}

with open('mask-use-by-county.csv', 'r') as f:
    csv = reader(f)
    for row in csv:
        usage[row[0]] = int((float(row[4]) + float(row[5])) * 255)

print 'const maskusage = %s' % usage
