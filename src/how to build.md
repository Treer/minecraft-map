# How to build from source

The Ink and Parchment Map files are already built and located in the `/www` directory, so
you don't need to build anything unless you wish to modify the source code in `/src`.

## Nodejs

The build tools use nodejs, so [install that first](https://nodejs.org/en/download/).

***WARNING:*** VisualStudio 2013 installs an old version of TypeScript. If you get a lot 
of `error TS1005` from the typescript compiler then the old version is probably in a more prominent 
place in your PATH environment variable. Use the command `where tsc` to find
out which one is running, you need version 1.5 or later. The command `tsc -v` gives the 
version you are using.

## Build tools

From the command-line, navigate to the `/src` directory, and run:
```
npm install
```   
That causes npm to inspect the `package.json` file and install all the build tools required by the Ink and Parchment Map:
 * typescript
 * uglifyjs
 * copyfiles
 
 
## Building

For a complete build, navigate in the command-line to the `/src` directory, and run:
```
npm run build
``` 
(uglifyjs will give some style warnings, but I believe I've fixed all the warnings that were genuine)


But during development you may want a faster build option that doesn't minify anything, for that you can use the following command (also from the `/src` directory):
```
tsc --project scripts
```
or 
```
npm run quickbuild
```
(which does the same thing)

## Notes

* I'm [using npm as the build tool](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/)