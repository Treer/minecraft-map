@echo off
REM uglifyjs is from https://github.com/mishoo/UglifyJS2 (or google it)
@echo on

call uglifyjs minecraftmap.js --comments --compress --mangle --lint --output minecraftmap.min.js

call uglifyjs js\csv.js --comments --compress --mangle --lint --output js\csv.min.js

call uglifyjs js\jquery.mapz.js --comments --compress --mangle --lint --output js\jquery.mapz.min.js

