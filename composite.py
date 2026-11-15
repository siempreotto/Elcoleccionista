import cv2, numpy as np, sys, json
R,Q,CARD,OUT=sys.argv[1:5]
N=169; START=72; FULL=72; OCC_END=0; OCC_T=34
CUTS={72:0.97,73:0.88,74:0.69,75:0.62,76:0.33,77:0.10,78:0.07}
qs=json.load(open(Q))
idx=list(range(START,N))
P=np.array([qs[str(i)] for i in idx],np.float64)   # (n,4,2)
# temporal smoothing of corners (centered moving average, window 5)
S=P.copy()
for k in range(len(idx)):
    a=max(0,k-2); b=min(len(idx),k+3); S[k]=P[a:b].mean(0)
card=cv2.imread(CARD).astype(np.float32)
REFI=86
REF=cv2.imread(f'{R}/f{REFI+1:03d}.png').astype(np.float32)
RQ=np.float32(qs[str(REFI)])
H0,W0=card.shape[:2]
src=np.float32([[0,0],[W0,0],[W0,H0],[0,H0]])
cl=cv2.cvtColor(card.astype(np.uint8),cv2.COLOR_BGR2GRAY).mean()
import os; os.makedirs(OUT,exist_ok=True)
for i in range(N):
    fr=cv2.imread(f'{R}/f{i+1:03d}.png').astype(np.float32)
    if i>=START:
        q=S[i-START].astype(np.float32)
        M=cv2.getPerspectiveTransform(src,q)
        w=cv2.warpPerspective(card,M,(fr.shape[1],fr.shape[0]),flags=cv2.INTER_AREA if i<120 else cv2.INTER_CUBIC)
        mask=np.zeros(fr.shape[:2],np.float32); cv2.fillConvexPoly(mask,q.astype(np.int32),1.0)
        mask=cv2.GaussianBlur(mask,(0,0),1.2)
        g=cv2.cvtColor(fr.astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32)
        fl=(g*mask).sum()/max(mask.sum(),1)
        gain=np.clip(fl/cl,0.35,1.15)
        w=w*gain
        h=0.5*np.clip((86-i)/14,0,1)   # early frames are hazy in the original
        w=(1-h)*w+h*cv2.GaussianBlur(fr,(0,0),6)
        w=0.9*w+0.1*fr   # keep a touch of the acrylic sheen
        alpha=1.0
        if i in CUTS:
            cm=np.zeros((H0,W0),np.float32); cm[int(CUTS[i]*H0):,:]=1.0
            cm=cv2.GaussianBlur(cm,(0,0),3.0)
            mask=mask*cv2.warpPerspective(cm,M,(fr.shape[1],fr.shape[0]))
        if i<OCC_END:
            # predict how the (unoccluded) original card would look here, compare with the frame
            Hm=cv2.getPerspectiveTransform(RQ,q)
            pred=cv2.warpPerspective(REF,Hm,(fr.shape[1],fr.shape[0]))
            inner=mask>0.5
            def norm(x):
                b=cv2.GaussianBlur(x,(0,0),3)
                lum=b.mean(2)
                ref_l=np.median(lum[inner]) if inner.any() else 1
                return b/(max(ref_l,1))
            a1=norm(fr); a2=norm(pred)
            # use the lower part (always visible first) to calibrate scale
            d=np.abs(a1-a2).sum(2)
            d=cv2.GaussianBlur(d,(0,0),4)
            thr=np.percentile(d[inner],35)*1.8
            vis=((d<thr)&inner).astype(np.uint8)
            vis=cv2.morphologyEx(vis,cv2.MORPH_OPEN,np.ones((9,9),np.uint8))
            vis=cv2.morphologyEx(vis,cv2.MORPH_CLOSE,np.ones((31,31),np.uint8))
            n,lab,st,_=cv2.connectedComponentsWithStats(vis)
            keep=np.zeros_like(vis)
            if n>1:
                k=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); keep[lab==k]=1
            vis=cv2.GaussianBlur(keep.astype(np.float32),(0,0),2.5)
            mask=mask*vis
        m3=(mask*alpha)[...,None]
        fr=fr*(1-m3)+w*m3
    cv2.imwrite(f'{OUT}/c{i:03d}.png',np.clip(fr,0,255).astype(np.uint8))
print('ok')
