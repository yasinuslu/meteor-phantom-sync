## PhantomJS Sync using fibers

Warning: You should be aware that page.evaluate sends your
function to phantomjs as string, so if you try to access any lexical scoped
variable you'll get an error.

Usage:
```js
var ph = PS.create();
var page = ph.createPage();
var status = page.open("http://www.google.com");
var result = page.evaluate(function () {
  return document.title;
});
ph.exit();
```

Parallel example
```js
var ph = PS.create();

Meteor.defer(function () {
  var page = ph.createPage();
  var status = page.open("http://www.google.com");
  var result = page.evaluate(function () {
    return document.title;
  });
  console.log('result: ', result);
});

Meteor.defer(function () {
  var page = ph.createPage();
  var status = page.open("http://www.github.com");
  var result = page.evaluate(function () {
    return document.title;
  });
  console.log('result: ', result);
});

// not sure when to call ph.exit :)
// we'll probably think of something
```
