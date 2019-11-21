import urllib.request
import gzip 
import json
import os
import threading
import ssl

def mkdir(path):
    isExists=os.path.exists(path)
 
    # 判断结果
    if not isExists:
        os.makedirs(path)  
        return True
    else:
        return False

def getAbsolutePath(dir,name):
    return os.path.abspath( os.path.join(dir,name))

def requestUrl(url):
    print(url)
    r = urllib.request.Request(url)
    r.add_header("User-Agent", 'Opera/9.61 (Windows NT 5.1; U; en) Presto/2.1.1')
    gcontext = ssl.SSLContext(ssl.PROTOCOL_TLSv1)
    try:s = urllib.request.urlopen(r,context=gcontext)
    except urllib.error.HTTPError as e: 
        s = urllib.request.urlopen(r,context=gcontext)

    con = s.read()
    content =gzip.decompress(con).decode("utf-8")
    return content

def requestBinaryUrl(url):
    print(url)
    r = urllib.request.Request(url)
    r.add_header("User-Agent", 'Opera/9.61 (Windows NT 5.1; U; en) Presto/2.1.1')
    gcontext = ssl.SSLContext(ssl.PROTOCOL_TLSv1)    
    try:s = urllib.request.urlopen(r,context=gcontext)
    except urllib.error.HTTPError as e: 
        s = s = urllib.request.urlopen(r,context=gcontext)
    con = s.read()
    content =gzip.decompress(con)
    return content

def savefile(content,path,name):
    mkdir(path)
    filePath = getAbsolutePath(path,name)
    fp = open(filePath,'w+')
    fp.write(content)
    fp.close()

def savefile2(content,path):
    mkdir(getAbsolutePath(path,"../"))
    filePath = path
    fp = open(filePath,'wb+')
    fp.write(content)
    fp.close()

def saveResource(nodeResources):
    url = nodeResources[0]
    path = nodeResources[1]

    material = nodeResources[2]
    materialUrl = urllib.parse.urljoin(url+ "/",material)
    content = requestUrl(materialUrl)
    absPath = getAbsolutePath(path,material)
    savefile(content,absPath,"shared.json")

    geo = nodeResources[3]
    geoUrl = urllib.parse.urljoin(url+ "/",geo)
    content = requestBinaryUrl(geoUrl)
    absPath = getAbsolutePath(path,geo)
    savefile2(content,absPath+".bin")

    texture = nodeResources[4]
    textureUrl = urllib.parse.urljoin(url+ "/",texture)
    content = requestBinaryUrl(textureUrl)
    absPath = getAbsolutePath(path,texture)
    savefile2(content,absPath+".bin.dds")
    


def layerDownload(url,dirPos):
    html = requestUrl(url)
    info = json.loads(html)
    savefile(html,dirPos,info["name"]+".json")
    return info["store"]["rootNode"]

def nodeDownload(url,dirPos,nodelist):
    html = requestUrl(url)
    info = json.loads(html)
    filename = info["id"]    
    path = getAbsolutePath(dirPos,filename)
    savefile(html,path,filename+".json")

    sharedResource = info["sharedResource"]["href"]
    geometryData = info["geometryData"]
    geometryHref = geometryData[len(geometryData)-1]["href"]
    textureData = info["textureData"]
    textureHref = textureData[len(textureData)-1]["href"]
    nodeResources = [url,path,sharedResource,geometryHref,textureHref]
    mutex.acquire()
    nodeDetails.append(nodeResources)
    mutex.release()
    #saveResource(nodeResources)

    children = info["children"]
    if children is not None:
        for child in children:
            name = child["id"]
            childUrl = child["href"]
            nodelist.append(urllib.parse.urljoin(url+ "/",childUrl))

    return 

#content = requestBinaryUrl("https://tiles.arcgis.com/tiles/FQD0rKU8X5sAQfh8/arcgis/rest/services/VRICON_Yosemite_Sample_Integrated_Mesh_scene_layer/SceneServer/layers/0/nodes/3-0-2-1-1-2-2-0-1-0-1-1-0/geometries/0")
#savefile2(content,"H:\i3s\i3s\\tewst.bin")

url2 = "https://tiles.arcgis.com/tiles/FQD0rKU8X5sAQfh8/arcgis/rest/services/VRICON_Yosemite_Sample_Integrated_Mesh_scene_layer/SceneServer/layers/0/"
dir = 'H:\i3s\i3s\\'

nodePath = layerDownload(url2,dir)
rootUrl = urllib.parse.urljoin(url2,nodePath)
rootPath = getAbsolutePath(dir,nodePath)

nodePath = getAbsolutePath(rootPath,"../")
mkdir(nodePath)

nodelist = [rootUrl]
nodeDetails = []
bFlag = True

class downloadThreadManager (threading.Thread):
    def __init__(self, threadNum):
        threading.Thread.__init__(self)
        self.threadNum = threadNum
    def run(self):
        print ("开始线程")
        while bFlag == True:
            if len(nodeDetails)>0 and  threading.active_count()<self.threadNum+1:
                mutex.acquire()
                nodeRS = nodeDetails.pop()
                mutex.release()
                tdID = threading.Thread(target=saveResource,args=(nodeRS,))
                tdID.start()



mutex = threading.Lock()

th = downloadThreadManager(10)
th.start()

while len(nodelist)>0:
    nodeUrl = nodelist.pop()
    nodeDownload(nodeUrl,nodePath,nodelist)

while len(nodeDetails)>0:
    bFlag = True

bFlag = False


