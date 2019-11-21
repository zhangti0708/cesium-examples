import urllib.request
import gzip 
import json
import os
import threading
import ssl
import time

# the LayerInfo of the STK Tile Data
layerjson = "https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/layer.json"
# the Path you want to save the tiles
savePath = "H:\stk\\"
# the format to save the tiles from json.tiles
pathformat = ".\{0}\{1}\{2}.terrain"
# the format of tile url from json.tiles
tileformat = "https://assets.agi.com/stk-terrain/v1/tilesets/world/tiles/{0}/{1}/{2}.terrain?v={3}"
# the version of STK from json.version
version = "1.31376.0"
# start and end level usually from 0 to 15
# you can get endLevel by len(available)-1
startlevel = 0
endLevel = 15

# HttpRequest
# url:the url you need to get
# bGzip: gzip decompress
def requestUrl(url,bGzip):
    print(url)
    r = urllib.request.Request(url)
    r.add_header("User-Agent", 'Opera/9.61 (Windows NT 5.1; U; en) Presto/2.1.1')
    gcontext = ssl.SSLContext(ssl.PROTOCOL_TLSv1)
    try:s = urllib.request.urlopen(r,context=gcontext)
    except urllib.error.HTTPError as e: 
        return None

    con = s.read()
    if bGzip==True:
        content =gzip.decompress(con)
    else:
        content =con

    return content

# get available attribute from json
# content:the json content
def getValidTiles(content):
    layerinfo = json.loads(content)
    available = layerinfo["available"]
    return available

# get local absolute path
# dir: Local direction
# name:file name
def getAbsolutePath(dir,name):
    return os.path.abspath( os.path.join(dir,name))

def mkdir(path):
    isExists=os.path.exists(path)

    if not isExists:
        os.makedirs(path)  
        return True
    else:
        return False

# save file
def savefile(content,dir,level,x,y):
    path = getAbsolutePath(dir,pathformat.format(level, x,y))
    preDir = getAbsolutePath(path,"../")
    if os.path.exists(preDir) == False:
        mkdir(preDir)

    filePath = path
    fp = open(filePath,'wb+')
    fp.write(content)
    fp.close()

# save file
def saveTile(nodeRS):
    level = nodeRS[0]
    x = nodeRS[1]
    y = nodeRS[2]

    tileUrl = tileformat.format(level, x,y,version)
    content = requestUrl(tileUrl,True)
    savefile(content,savePath,level,x,y)

# get layer.json and available attribute from layer.json
content = requestUrl(layerjson,False)
available = getValidTiles(content)

nodeDetails = []
bFlag = True

# ThreadManager for the download of STK Tiles
class downloadThreadManager (threading.Thread):
    def __init__(self, threadNum):
        threading.Thread.__init__(self)
        self.threadNum = threadNum
    def run(self):
        while bFlag == True:
            if len(nodeDetails)>0 and  threading.active_count()<self.threadNum+1:
                mutex.acquire()
                nodeRS = nodeDetails.pop()
                mutex.release()
                tdID = threading.Thread(target=saveTile,args=(nodeRS,))
                tdID.start()



# mutex for nodeDetails
mutex = threading.Lock()

# start the downloading thread
th = downloadThreadManager(10)
th.start()

# add the tiles needed to request to the nodeDetails list
# the maximum length of the list is 3000
# and waiting time for threads to download is 120 seconds
endLevel = len(available)-1
while startlevel<endLevel+1:
    tilesList = available[startlevel]
    while len(tilesList)>0:
        tiles = tilesList.pop()
        startX = tiles["startX"]
        startY = tiles["startY"]
        endX = tiles["endX"]
        endY = tiles["endY"]
        for x in range(startX,endX+1):
            for y in range(startY,endY+1):
                tileInfo = [startlevel,x,y]
                mutex.acquire()
                nodeDetails.append(tileInfo)
                mutex.release()
                if len(nodeDetails)>3000:
                    time.sleep(120)


    startlevel += 1


while len(nodeDetails)>0:
    bFlag = True

bFlag = False



