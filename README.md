# snap-batch-summary
A horrible hack to batch download Snap project summaries

1. To run on cloud9 (after cloning this to a new cloud9 workspace):
1. Run `npm install` to download selenium-webdriver.  
1. selenium seems to run firefox, and firefox requires a display.
If you want to run it all on the command line, you can use `xvfb`.  So the command is: `xvfb-run node main.js`.  
1. To use selenium in python, install it with `sudo pip install selenium`
1. Run a script with `xvfb-run python script.py`


todo: 
[x] Detect errors
[ ] Create a summary from an xml file (all on disk)
[ ] Get the list of files from
   [ ] a file on disk
   [x] the command line
   [ ] a url
[ ] upload xml file to github
[ ] create a cron job that nightly downloads a set of projects and updates xml files in github.

