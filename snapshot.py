# ------
# by David Nelson (dlneslon)
# ------

import os, re, time, traceback

PATH = r"C:\Users\dlnelson\Desktop\TEALS\Snapshot"

url_parse_pattern = re.compile(
    r"https?://snap.berkeley.edu/snapsource/snap.html#(present|cloud):"
    r"Username=(?P<user>[^&]+)&?ProjectName=(?P<project>[^ \n]+)"
)

def parse_url(url):
    m = url_parse_pattern.match(url)
    return (m.group('user').lower(), m.group('project')) if m else (None, None)

def add_url(url):
    username, project = parse_url(url)
    if username is None or project is None:
        print "Failed to parse", url
    else:
        add_project(username, project)

def add_project(username, project):
    assert "&" not in username, username
    assert "&" not in project, project
    snapdir = "%s&%s"%(username.replace("\\", "%5C"),
                       project.replace("\\", "%5C"))
    path = os.path.join(PATH, snapdir)
    if os.path.exists(path):
        print "path already exists", path
        return
    os.makedirs(path)
    take_snapshot(path)

raw_url = "https://snap.apps.miosoft.com/SnapCloudRawPublic?"

def fetch_project(url):
    import requests, urllib, urlparse
    project_id = url.split("#", 1)[1].split(":", 1)[1]
    qs = urlparse.parse_qs(project_id)
    username = qs['Username'][0].lower()
    project_name = qs['ProjectName'][0]
    project_id = urllib.urlencode(dict(Username=username,
                                       ProjectName=project_name))
    resp = requests.get(raw_url+project_id, verify=False)
    return resp.text

def take_snapshot(path):
    import datetime
    from dateutil.tz import tzlocal
    username, project = os.path.basename(path).split("&", 1)
    url = ("http://snap.berkeley.edu/snapsource/snap.html"
           "#cloud:Username=%s&ProjectName=%s"%(username, project))
    data = fetch_project(url)
    assert data.startswith("<snapdata>"), (path, data)
    ts = datetime.datetime.now(tzlocal()).strftime("%Y-%m-%d %H_%M_%S%z")
    names = os.listdir(path)
    names.sort()
    if names:
        with open(os.path.join(path, names[-1]), 'rb') as f:
            last = f.read().decode("utf-8")
    else:
        last = ""
    if data == last: return None
    outpath = os.path.join(path, "%s - %s - %s.xml"%(username, project, ts))
    with open(outpath, 'wb') as f:
        f.write(data.encode("utf-8"))
    return outpath

def run():
    SNAP_INTERVAL = 60*60 # 1 hour
    if not os.path.exists(PATH): os.makedirs(PATH)
    while True:
        print "Scanning"
        for name in os.listdir(PATH):
            print "Processing", name
            path = os.path.join(PATH, name)
            if os.path.isdir(path):
                try:
                    outpath = take_snapshot(path)
                    if outpath is not None:
                        print "  Updated", os.path.basename(outpath)
                except Exception:
                    print traceback.format_exc()
        print "Sleeping"
        t = time.time()
        while time.time() - t < SNAP_INTERVAL:
            time.sleep(.1)

