module.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return e[r].call(o.exports,o,o.exports,n),o.l=!0,o.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)n.d(r,o,function(t){return e[t]}.bind(null,o));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=2)}([function(e,t){e.exports=require("axios")},function(e,t){e.exports=require("set-cookie-parser")},function(e,t,n){"use strict";n.r(t);var r=n(0),o=n.n(r),s=n(1),i=n.n(s);function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var u=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.env={JWT_COOKIE:t.JWT_COOKIE||"TKN",XSRF_COOKIE:t.XSRF_HEADER||"XSRF-TOKEN",IS_DEV:"development"===(t.NODE_ENV||"production"),COOKIE_DOMAIN:t.COOKIE_DOMAIN||"localhost"}}return function(e,t,n){t&&a(e.prototype,t),n&&a(e,n)}(e,[{key:"setResponseCookies",value:function(e,t){var n=i.a.parse(t),r=!0,o=!1,s=void 0;try{for(var a,u=n[Symbol.iterator]();!(r=(a=u.next()).done);r=!0){var c=a.value,l=c.name===this.env.XSRF_COOKIE;e.cookie(c.name,c.value,{path:c.path,secure:!this.env.IS_DEV,httpOnly:!l,sameSite:l,domain:this.env.COOKIE_DOMAIN})}}catch(e){o=!0,s=e}finally{try{r||null==u.return||u.return()}finally{if(o)throw s}}}},{key:"setJwtCookie",value:function(e,t){e.cookie(this.env.JWT_COOKIE,t,{path:"/",domain:this.env.COOKIE_DOMAIN,secure:!this.env.IS_DEV,httpOnly:!0})}},{key:"clearJwtCookie",value:function(e){e.clearCookie(this.env.JWT_COOKIE,{path:"/",domain:this.env.COOKIE_DOMAIN})}},{key:"cookiesToHeaders",value:function(e){return{"X-XSRF-TOKEN":e[this.env.XSRF_COOKIE]||"",Cookie:"PHPSESSID="+e.PHPSESSID||""}}},{key:"getFormId",value:function(e){return e.vars&&(e=e.vars),"form_"+(e.id||e.attr.id)}}]),e}();function c(e,t,n,r,o,s,i){try{var a=e[s](i),u=a.value}catch(e){return void n(e)}a.done?t(u):Promise.resolve(u).then(r,o)}function l(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}n.d(t,"default",function(){return f});var f=function(){function e(t){!function(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}(this,e),this.env=t,this.utilities=new u(this.env),this.logging="development"===t.NODE_ENV}return function(e,t,n){t&&l(e.prototype,t),n&&l(e,n)}(e,[{key:"login",value:function(e){var t=this,n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,r=e.session,s=e.body._action;"/"!==s.substr(0,1)&&(s="/"+s);var i=this.env.API_URL+s;return this.logging&&console.log("login posting to: "+i),o.a.post(i,{username:e.body.username,password:e.body.password},{headers:this.utilities.cookiesToHeaders(e.cookies)}).then(function(e){if(t.logging&&console.error(e),r.authToken=e.data.token,r.refreshToken=e.data.refresh_token,t.utilities.setJwtCookie(n,r.authToken),t.utilities.setResponseCookies(n,e),!n)return r.authToken;n.status(200).json({token:r.authToken})}).catch(function(e){if(t.logging&&console.error(e),!n)return e;e.response?401===e.response.status?n.status(401).json(e.response.data):n.status(e.response.status).json({message:e.response.data?e.response.data.error&&e.response.data.error.exception?e.response.data.error.exception[0].message:e.response.data.message:e.message}):n.status(500).json({message:e.message})})}},{key:"logout",value:function(e,t){e.session.authToken=null,e.session.destroy(),this.utilities.clearJwtCookie(t),t.status(200).json({success:!0})}},{key:"jwtRefresh",value:function(){var e=function(e){return function(){var t=this,n=arguments;return new Promise(function(r,o){var s=e.apply(t,n);function i(e){c(s,r,o,i,a,"next",e)}function a(e){c(s,r,o,i,a,"throw",e)}i(void 0)})}}(regeneratorRuntime.mark(function e(t,n){var r,s,i,a,u,c,l,f,h=arguments;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return r=!(h.length>2&&void 0!==h[2])||h[2],(s=t.session).refreshToken||(this.utilities.clearJwtCookie(n),i="Invalid session - no refresh token available",this.logging&&console.log(i),n.status(400).json({message:i})),a=this.env.API_URL+"/token/refresh",e.prev=4,e.next=7,o.a.post(a,{refresh_token:s.refreshToken},{headers:this.utilities.cookiesToHeaders(t.cookies),refreshTokenRequest:!0});case 7:if(u=e.sent,this.logging&&console.error("jwtRefresh response",u),c=u.data,s.authToken=c.token,s.refreshToken=c.refresh_token,this.utilities.setJwtCookie(n,s.authToken),r){e.next=15;break}return e.abrupt("return",s.authToken);case 15:n.status(200).json({token:s.authToken}),e.next=34;break;case 18:if(e.prev=18,e.t0=e.catch(4),this.utilities.clearJwtCookie(n),r){e.next=23;break}throw new Error(e.t0);case 23:if(this.logging&&console.error("RefreshToken Error",e.t0),n.status(500),void 0!==e.t0.response){e.next=28;break}return n.json({message:e.t0.message||e.t0}),e.abrupt("return");case 28:if(void 0!==e.t0.response.data){e.next=31;break}return n.json({message:e.t0}),e.abrupt("return");case 31:return l=e.t0.response.data.error&&e.t0.response.data.error.exception,f=l?e.t0.response.data.error.exception[0].message:e.t0.response.data.message||"unknown error",e.abrupt("return",n.json({message:"Refresh token rejected",error:f}));case 34:case"end":return e.stop()}},e,this,[[4,18]])}));return function(t,n){return e.apply(this,arguments)}}()}]),e}()}]);