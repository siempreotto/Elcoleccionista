import cv2, numpy as np, sys, json
R=sys.argv[1]; OUT=sys.argv[2]
N=169
quad=np.float32([[330,186],[770,181],[843,668],[306,681]])
sift=cv2.SIFT_create(4000)
def load(i): return cv2.imread(f'{R}/f{i+1:03d}.png')
quads={N-1:quad.copy()}
prev=load(N-1); pg=cv2.cvtColor(prev,cv2.COLOR_BGR2GRAY)
log=[]
for i in range(N-2,40,-1):
    cur=load(i); cg=cv2.cvtColor(cur,cv2.COLOR_BGR2GRAY)
    q=quads[i+1]
    c=q.mean(0); big=(q-c)*1.6+c
    m1=np.zeros(pg.shape,np.uint8); cv2.fillConvexPoly(m1,big.astype(np.int32),255)
    m2=cv2.dilate(m1,np.ones((61,61),np.uint8))
    k1,d1=sift.detectAndCompute(pg,m1); k2,d2=sift.detectAndCompute(cg,m2)
    if d1 is None or d2 is None or len(k1)<12 or len(k2)<12: log.append((i,'nofeat')); break
    mt=cv2.BFMatcher().knnMatch(d1,d2,k=2)
    good=[a for a,b in mt if a.distance<0.75*b.distance]
    if len(good)<12: log.append((i,'fewmatch',len(good))); break
    s=np.float32([k1[g.queryIdx].pt for g in good]); d=np.float32([k2[g.trainIdx].pt for g in good])
    H,inl=cv2.findHomography(s,d,cv2.RANSAC,3.0)
    if H is None: log.append((i,'noH')); break
    nq=cv2.perspectiveTransform(q.reshape(-1,1,2),H).reshape(-1,2)
    quads[i]=nq; log.append((i,int(inl.sum()),len(good)))
    prev,pg=cur,cg
json.dump({str(k):v.tolist() for k,v in quads.items()},open(OUT,'w'))
for l in log[::8]: print(l)
print('last',log[-3:])
