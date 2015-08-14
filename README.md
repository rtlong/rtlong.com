# rtlong.com

This is my personal website: [rtlong.com][]. It's built with [Hugo][hugo],
deployed on S3 and served via CloudFront for SSL termination and low latency.

### Notice: WIP
> This is a WIP. Content is incomplete and it is not yet deployed on rtlong.com.
> See [rtlong.com-old][] for what's currently deployed.

## Dev

### Dependencies

1. Hugo and optionally Forego to use the Procfile
    ```
    brew install hugo forego
    ```

2. NodeJS, NPM

### Building

```
make
```

### Dev feedback loop

This will run Forego which in turn runs webpack and hugo in watch/server modes

```
make dev
```

Open <http://localhost:1313>


[rtlong.com]: http://rtlong.com
[rtlong.com-old]: https://github.com/rtlong/rtlong.com-old/tree/master/static
[hugo]: http://gohugo.io/
