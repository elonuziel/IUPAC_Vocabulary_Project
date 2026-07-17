import sys; sys.stdout.reconfigure(encoding='utf-8')
html = open('IUPAC_Searchable_Vocabulary.html','r',encoding='utf-8').read()
idx = html.find('detailSmiles')
print(html[idx-50:idx+400])
