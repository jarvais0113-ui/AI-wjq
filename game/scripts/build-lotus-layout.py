from PIL import Image,ImageDraw
from collections import deque
import pathlib,json,math
root=pathlib.Path(__file__).resolve().parents[1];im=Image.open(root/'docs/references/lotus-minimap-reference.png').convert('RGBA');n=160
rows=[]
for z in range(n):
 row=[]
 for x in range(n):
  samples=[im.getpixel((min(1023,int((x+dx)*1024/n)),min(1023,int((z+dz)*1024/n)))) for dx,dz in [(0.25,.25),(.75,.25),(.5,.5),(.25,.75),(.75,.75)]]
  row.append(1 if sum(p[3]>200 and max(p[:3])>55 for p in samples)>=2 else 0)
 rows.append(row)
# Keep the connected playable plan; isolated annotation pixels are not floor.
seen=set();groups=[]
for z in range(n):
 for x in range(n):
  if not rows[z][x] or (x,z) in seen:continue
  q=deque([(x,z)]);seen.add((x,z));group=[]
  while q:
   a,b=q.popleft();group.append((a,b))
   for c,d in [(a+1,b),(a-1,b),(a,b+1),(a,b-1)]:
    if 0<=c<n and 0<=d<n and rows[d][c] and (c,d) not in seen:seen.add((c,d));q.append((c,d))
  groups.append(group)
keep=set(max(groups,key=len))
rows=[''.join('1' if (x,z) in keep else '0' for x in range(n)) for z in range(n)]
m=json.loads((root/'docs/references/lotus-metadata.json').read_text());points={}
for c in m['callouts']:
 p=c['location'];x=(p['y']*m['xMultiplier']+m['xScalarToAdd'])*160;z=(p['x']*m['yMultiplier']+m['yScalarToAdd'])*160;points[c['superRegionName']+' '+c['regionName']]=[round(x,2),round(z,2)]
text='// Reconstructed public Lotus minimap contour, 1m grid; not original 3D collision.\nexport const GRID='+json.dumps(rows)+';\nexport const CALLOUTS='+json.dumps(points,ensure_ascii=False)+';\n'
(root/'dist/lotus-layout.mjs').write_text(text)
print('floor cells',len(keep),'components',sorted([len(g) for g in groups],reverse=True)[:8]);print(points)
qa=Image.new('RGB',(640,640),'#243a32');d=ImageDraw.Draw(qa)
for z,row in enumerate(rows):
 for x,v in enumerate(row):
  if v=='1':d.rectangle((x*4,z*4,x*4+3,z*4+3),fill='#cbbfa0')
for k,p in points.items():
 if 'Site' in k or 'Spawn' in k:d.text((p[0]*4,p[1]*4),k,fill='#eb655c')
qa.save(root/'outputs/重建平面-QA.png')
