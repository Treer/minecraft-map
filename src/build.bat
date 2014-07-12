@echo off
REM uglifyjs   is from https://github.com/mishoo/UglifyJS2 (or google it)
REM preprocess is from https://github.com/dcodeIO/Preprocessor.js
@echo on

call preprocess minecraftmap.pp.js > ..\www\js\minecraftmap.js

copy libs\csv.js ..\www\js\csv.js
copy libs\StackBlur.js ..\www\js\StackBlur.js
copy libs\jquery.mapz.js ..\www\js\jquery.mapz.js

call uglifyjs ..\www\js\minecraftmap.js --comments --compress --mangle --lint --output ..\www\js\minecraftmap.min.js
call uglifyjs libs\csv.js --comments --compress --mangle --lint --output ..\www\js\csv.min.js
call uglifyjs libs\StackBlur.js --comments --compress --mangle --lint --output ..\www\js\StackBlur.min.js
call uglifyjs libs\jquery.mapz.js --comments --compress --mangle --lint --output ..\www\js\jquery.mapz.min.js

