(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  for (var i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(
      uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)
    ))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}

},{}],2:[function(require,module,exports){

},{}],3:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"dup":2}],4:[function(require,module,exports){
(function (Buffer){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () { return 42 } }
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  enumerable: true,
  get: function () {
    if (!Buffer.isBuffer(this)) return undefined
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('The value "' + length + '" is invalid for option "size"')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new TypeError(
        'The "string" argument must be of type string. Received type number'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species != null &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  if (ArrayBuffer.isView(value)) {
    return fromArrayLike(value)
  }

  if (value == null) {
    throw TypeError(
      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
      'or Array-like Object. Received type ' + (typeof value)
    )
  }

  if (isInstance(value, ArrayBuffer) ||
      (value && isInstance(value.buffer, ArrayBuffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'number') {
    throw new TypeError(
      'The "value" argument must not be of type number. Received type number'
    )
  }

  var valueOf = value.valueOf && value.valueOf()
  if (valueOf != null && valueOf !== value) {
    return Buffer.from(valueOf, encodingOrOffset, length)
  }

  var b = fromObject(value)
  if (b) return b

  if (typeof Symbol !== 'undefined' && Symbol.toPrimitive != null &&
      typeof value[Symbol.toPrimitive] === 'function') {
    return Buffer.from(
      value[Symbol.toPrimitive]('string'), encodingOrOffset, length
    )
  }

  throw new TypeError(
    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
    'or Array-like Object. Received type ' + (typeof value)
  )
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('The value "' + size + '" is invalid for option "size"')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj.length !== undefined) {
    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
      return createBuffer(0)
    }
    return fromArrayLike(obj)
  }

  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
    return fromArrayLike(obj.data)
  }
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true &&
    b !== Buffer.prototype // so Buffer.isBuffer(Buffer.prototype) will be false
}

Buffer.compare = function compare (a, b) {
  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength)
  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength)
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError(
      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
    )
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (isInstance(buf, Uint8Array)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    throw new TypeError(
      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
      'Received type ' + typeof string
    )
  }

  var len = string.length
  var mustMatch = (arguments.length > 2 && arguments[2] === true)
  if (!mustMatch && len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) {
          return mustMatch ? -1 : utf8ToBytes(string).length // assume utf8
        }
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  str = this.toString('hex', 0, max).replace(/(.{2})/g, '$1 ').trim()
  if (this.length > max) str += ' ... '
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (isInstance(target, Uint8Array)) {
    target = Buffer.from(target, target.offset, target.byteLength)
  }
  if (!Buffer.isBuffer(target)) {
    throw new TypeError(
      'The "target" argument must be one of type Buffer or Uint8Array. ' +
      'Received type ' + (typeof target)
    )
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
          : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : Buffer.from(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
// the `instanceof` check but they should be treated as of that type.
// See: https://github.com/feross/buffer/issues/166
function isInstance (obj, type) {
  return obj instanceof type ||
    (obj != null && obj.constructor != null && obj.constructor.name != null &&
      obj.constructor.name === type.name)
}
function numberIsNaN (obj) {
  // For IE11 support
  return obj !== obj // eslint-disable-line no-self-compare
}

}).call(this,require("buffer").Buffer)
},{"base64-js":1,"buffer":4,"ieee754":7}],5:[function(require,module,exports){
(function (Buffer){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.

function isArray(arg) {
  if (Array.isArray) {
    return Array.isArray(arg);
  }
  return objectToString(arg) === '[object Array]';
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = Buffer.isBuffer;

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

}).call(this,{"isBuffer":require("../../insert-module-globals/node_modules/is-buffer/index.js")})
},{"../../insert-module-globals/node_modules/is-buffer/index.js":9}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],7:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],8:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],9:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],10:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],11:[function(require,module,exports){
(function (process){
'use strict';

if (!process.version ||
    process.version.indexOf('v0.') === 0 ||
    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
  module.exports = { nextTick: nextTick };
} else {
  module.exports = process
}

function nextTick(fn, arg1, arg2, arg3) {
  if (typeof fn !== 'function') {
    throw new TypeError('"callback" argument must be a function');
  }
  var len = arguments.length;
  var args, i;
  switch (len) {
  case 0:
  case 1:
    return process.nextTick(fn);
  case 2:
    return process.nextTick(function afterTickOne() {
      fn.call(null, arg1);
    });
  case 3:
    return process.nextTick(function afterTickTwo() {
      fn.call(null, arg1, arg2);
    });
  case 4:
    return process.nextTick(function afterTickThree() {
      fn.call(null, arg1, arg2, arg3);
    });
  default:
    args = new Array(len - 1);
    i = 0;
    while (i < args.length) {
      args[i++] = arguments[i];
    }
    return process.nextTick(function afterTick() {
      fn.apply(null, args);
    });
  }
}


}).call(this,require('_process'))
},{"_process":12}],12:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],13:[function(require,module,exports){
module.exports = require('./lib/_stream_duplex.js');

},{"./lib/_stream_duplex.js":14}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a duplex stream is just a stream that is both readable and writable.
// Since JS doesn't have multiple prototypal inheritance, this class
// prototypally inherits from Readable, and then parasitically from
// Writable.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

/*<replacement>*/
var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    keys.push(key);
  }return keys;
};
/*</replacement>*/

module.exports = Duplex;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

var Readable = require('./_stream_readable');
var Writable = require('./_stream_writable');

util.inherits(Duplex, Readable);

{
  // avoid scope creep, the keys array can then be collected
  var keys = objectKeys(Writable.prototype);
  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
  }
}

function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  pna.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }
    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

Duplex.prototype._destroy = function (err, cb) {
  this.push(null);
  this.end();

  pna.nextTick(cb, err);
};
},{"./_stream_readable":16,"./_stream_writable":18,"core-util-is":5,"inherits":8,"process-nextick-args":11}],15:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a passthrough stream.
// basically just the most minimal sort of Transform stream.
// Every written chunk gets output as-is.

'use strict';

module.exports = PassThrough;

var Transform = require('./_stream_transform');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(PassThrough, Transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};
},{"./_stream_transform":17,"core-util-is":5,"inherits":8}],16:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Readable;

/*<replacement>*/
var isArray = require('isarray');
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Readable.ReadableState = ReadableState;

/*<replacement>*/
var EE = require('events').EventEmitter;

var EElistenerCount = function (emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var debugUtil = require('util');
var debug = void 0;
if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function () {};
}
/*</replacement>*/

var BufferList = require('./internal/streams/BufferList');
var destroyImpl = require('./internal/streams/destroy');
var StringDecoder;

util.inherits(Readable, Stream);

var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

  // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.
  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var readableHwm = options.readableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // has it been destroyed
  this.destroyed = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  Stream.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  get: function () {
    if (this._readableState === undefined) {
      return false;
    }
    return this._readableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._readableState.destroyed = value;
  }
});

Readable.prototype.destroy = destroyImpl.destroy;
Readable.prototype._undestroy = destroyImpl.undestroy;
Readable.prototype._destroy = function (err, cb) {
  this.push(null);
  cb(err);
};

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;
      if (encoding !== state.encoding) {
        chunk = Buffer.from(chunk, encoding);
        encoding = '';
      }
      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  var state = stream._readableState;
  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
    if (er) {
      stream.emit('error', er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
        chunk = _uint8ArrayToBuffer(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        stream.emit('error', new Error('stream.push() after EOF'));
      } else {
        state.reading = false;
        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
    }
  }

  return needMoreData(state);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    stream.emit('data', chunk);
    stream.read(0);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

    if (state.needReadable) emitReadable(stream);
  }
  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;
  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder) StringDecoder = require('string_decoder/').StringDecoder;
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    pna.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('_read() is not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');
    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = { hasUnpiped: false };

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, unpipeInfo);
    }return this;
  }

  // try to find the right one.
  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;

  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this, unpipeInfo);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = Stream.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        pna.nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    pna.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;

  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  }

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  this._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._readableState.highWaterMark;
  }
});

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    pna.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./_stream_duplex":14,"./internal/streams/BufferList":19,"./internal/streams/destroy":20,"./internal/streams/stream":21,"_process":12,"core-util-is":5,"events":6,"inherits":8,"isarray":10,"process-nextick-args":11,"safe-buffer":26,"string_decoder/":28,"util":2}],17:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// a transform stream is a readable/writable stream where you do
// something with the data.  Sometimes it's called a "filter",
// but that's not a great name for it, since that implies a thing where
// some bits pass through, and others are simply ignored.  (That would
// be a valid example of a transform, of course.)
//
// While the output is causally related to the input, it's not a
// necessarily symmetric or synchronous transformation.  For example,
// a zlib stream might take multiple plain-text writes(), and then
// emit a single compressed chunk some time in the future.
//
// Here's how this works:
//
// The Transform stream has all the aspects of the readable and writable
// stream classes.  When you write(chunk), that calls _write(chunk,cb)
// internally, and returns false if there's a lot of pending writes
// buffered up.  When you call read(), that calls _read(n) until
// there's enough pending readable data buffered up.
//
// In a transform stream, the written data is placed in a buffer.  When
// _read(n) is called, it transforms the queued up data, calling the
// buffered _write cb's as it consumes chunks.  If consuming a single
// written chunk would result in multiple output chunks, then the first
// outputted bit calls the readcb, and subsequent chunks just go into
// the read buffer, and will cause it to emit 'readable' if necessary.
//
// This way, back-pressure is actually determined by the reading side,
// since _read has to be called to start processing a new chunk.  However,
// a pathological inflate type of transform can cause excessive buffering
// here.  For example, imagine a stream where every byte of input is
// interpreted as an integer from 0-255, and then results in that many
// bytes of output.  Writing the 4 bytes {ff,ff,ff,ff} would result in
// 1kb of data being output.  In this case, you could write a very small
// amount of input, and end up with a very large amount of output.  In
// such a pathological inflating mechanism, there'd be no way to tell
// the system to stop doing the transform.  A single 4MB write could
// cause the system to run out of memory.
//
// However, even in such a pathological case, only a single written chunk
// would be consumed, and then the rest would wait (un-transformed) until
// the results of the previous transformed chunk were consumed.

'use strict';

module.exports = Transform;

var Duplex = require('./_stream_duplex');

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

util.inherits(Transform, Duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) {
    return this.emit('error', new Error('write callback called multiple times'));
  }

  ts.writechunk = null;
  ts.writecb = null;

  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);

  cb(er);

  var rs = this._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  };

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  // When the writable side finishes, then flush out anything remaining.
  this.on('prefinish', prefinish);
}

function prefinish() {
  var _this = this;

  if (typeof this._flush === 'function') {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('_transform() is not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  var _this2 = this;

  Duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
    _this2.emit('close');
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);

  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}
},{"./_stream_duplex":14,"core-util-is":5,"inherits":8}],18:[function(require,module,exports){
(function (process,global,setImmediate){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// A bit simpler than readable streams.
// Implement an async ._write(chunk, encoding, cb), and it'll handle all
// the drain event emission and buffering.

'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

module.exports = Writable;

/* <replacement> */
function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;
  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/
var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
/*</replacement>*/

/*<replacement>*/
var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;

/*<replacement>*/
var util = require('core-util-is');
util.inherits = require('inherits');
/*</replacement>*/

/*<replacement>*/
var internalUtil = {
  deprecate: require('util-deprecate')
};
/*</replacement>*/

/*<replacement>*/
var Stream = require('./internal/streams/stream');
/*</replacement>*/

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
var OurUint8Array = global.Uint8Array || function () {};
function _uint8ArrayToBuffer(chunk) {
  return Buffer.from(chunk);
}
function _isUint8Array(obj) {
  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
}

/*</replacement>*/

var destroyImpl = require('./internal/streams/destroy');

util.inherits(Writable, Stream);

function nop() {}

function WritableState(options, stream) {
  Duplex = Duplex || require('./_stream_duplex');

  options = options || {};

  // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.
  var isDuplex = stream instanceof Duplex;

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var writableHwm = options.writableHighWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

  // cast to ints.
  this.highWaterMark = Math.floor(this.highWaterMark);

  // if _final has been called
  this.finalCalled = false;

  // drain event flag.
  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // has it been destroyed
  this.destroyed = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function () {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})();

// Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.
var realHasInstance;
if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function (object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;

      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function (object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || require('./_stream_duplex');

  // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.

  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
    return new Writable(options);
  }

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;

    if (typeof options.destroy === 'function') this._destroy = options.destroy;

    if (typeof options.final === 'function') this._final = options.final;
  }

  Stream.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  pna.nextTick(cb, er);
}

// Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;

  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    pna.nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;
  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function () {
    return this._writableState.highWaterMark;
  }
});

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);
    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    pna.nextTick(cb, er);
    // this can emit finish, and it will always happen
    // after error
    pna.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    stream.emit('error', er);
    // this can emit finish, but finish must
    // always follow error
    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
      asyncWrite(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    var allBuffers = true;
    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }
    buffer.allBuffers = allBuffers;

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('_write() is not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}
function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;
    if (err) {
      stream.emit('error', err);
    }
    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}
function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function') {
      state.pendingcb++;
      state.finalCalled = true;
      pna.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    prefinish(stream, state);
    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;
  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  }
  if (state.corkedRequestsFree) {
    state.corkedRequestsFree.next = corkReq;
  } else {
    state.corkedRequestsFree = corkReq;
  }
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  get: function () {
    if (this._writableState === undefined) {
      return false;
    }
    return this._writableState.destroyed;
  },
  set: function (value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    }

    // backward compatibility, the user is explicitly
    // managing destroyed
    this._writableState.destroyed = value;
  }
});

Writable.prototype.destroy = destroyImpl.destroy;
Writable.prototype._undestroy = destroyImpl.undestroy;
Writable.prototype._destroy = function (err, cb) {
  this.end();
  cb(err);
};
}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("timers").setImmediate)
},{"./_stream_duplex":14,"./internal/streams/destroy":20,"./internal/streams/stream":21,"_process":12,"core-util-is":5,"inherits":8,"process-nextick-args":11,"safe-buffer":26,"timers":29,"util-deprecate":30}],19:[function(require,module,exports){
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Buffer = require('safe-buffer').Buffer;
var util = require('util');

function copyBuffer(src, target, offset) {
  src.copy(target, offset);
}

module.exports = function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  BufferList.prototype.push = function push(v) {
    var entry = { data: v, next: null };
    if (this.length > 0) this.tail.next = entry;else this.head = entry;
    this.tail = entry;
    ++this.length;
  };

  BufferList.prototype.unshift = function unshift(v) {
    var entry = { data: v, next: this.head };
    if (this.length === 0) this.tail = entry;
    this.head = entry;
    ++this.length;
  };

  BufferList.prototype.shift = function shift() {
    if (this.length === 0) return;
    var ret = this.head.data;
    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
    --this.length;
    return ret;
  };

  BufferList.prototype.clear = function clear() {
    this.head = this.tail = null;
    this.length = 0;
  };

  BufferList.prototype.join = function join(s) {
    if (this.length === 0) return '';
    var p = this.head;
    var ret = '' + p.data;
    while (p = p.next) {
      ret += s + p.data;
    }return ret;
  };

  BufferList.prototype.concat = function concat(n) {
    if (this.length === 0) return Buffer.alloc(0);
    if (this.length === 1) return this.head.data;
    var ret = Buffer.allocUnsafe(n >>> 0);
    var p = this.head;
    var i = 0;
    while (p) {
      copyBuffer(p.data, ret, i);
      i += p.data.length;
      p = p.next;
    }
    return ret;
  };

  return BufferList;
}();

if (util && util.inspect && util.inspect.custom) {
  module.exports.prototype[util.inspect.custom] = function () {
    var obj = util.inspect({ length: this.length });
    return this.constructor.name + ' ' + obj;
  };
}
},{"safe-buffer":26,"util":2}],20:[function(require,module,exports){
'use strict';

/*<replacement>*/

var pna = require('process-nextick-args');
/*</replacement>*/

// undocumented cb() API, needed for core, not for public API
function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err && (!this._writableState || !this._writableState.errorEmitted)) {
      pna.nextTick(emitErrorNT, this, err);
    }
    return this;
  }

  // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks

  if (this._readableState) {
    this._readableState.destroyed = true;
  }

  // if this is a duplex stream mark the writable part as destroyed as well
  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      pna.nextTick(emitErrorNT, _this, err);
      if (_this._writableState) {
        _this._writableState.errorEmitted = true;
      }
    } else if (cb) {
      cb(err);
    }
  });

  return this;
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

module.exports = {
  destroy: destroy,
  undestroy: undestroy
};
},{"process-nextick-args":11}],21:[function(require,module,exports){
module.exports = require('events').EventEmitter;

},{"events":6}],22:[function(require,module,exports){
module.exports = require('./readable').PassThrough

},{"./readable":23}],23:[function(require,module,exports){
exports = module.exports = require('./lib/_stream_readable.js');
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = require('./lib/_stream_writable.js');
exports.Duplex = require('./lib/_stream_duplex.js');
exports.Transform = require('./lib/_stream_transform.js');
exports.PassThrough = require('./lib/_stream_passthrough.js');

},{"./lib/_stream_duplex.js":14,"./lib/_stream_passthrough.js":15,"./lib/_stream_readable.js":16,"./lib/_stream_transform.js":17,"./lib/_stream_writable.js":18}],24:[function(require,module,exports){
module.exports = require('./readable').Transform

},{"./readable":23}],25:[function(require,module,exports){
module.exports = require('./lib/_stream_writable.js');

},{"./lib/_stream_writable.js":18}],26:[function(require,module,exports){
/* eslint-disable node/no-deprecated-api */
var buffer = require('buffer')
var Buffer = buffer.Buffer

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key]
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports)
  exports.Buffer = SafeBuffer
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer)

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size)
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding)
    } else {
      buf.fill(fill)
    }
  } else {
    buf.fill(0)
  }
  return buf
}

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
}

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
}

},{"buffer":4}],27:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

module.exports = Stream;

var EE = require('events').EventEmitter;
var inherits = require('inherits');

inherits(Stream, EE);
Stream.Readable = require('readable-stream/readable.js');
Stream.Writable = require('readable-stream/writable.js');
Stream.Duplex = require('readable-stream/duplex.js');
Stream.Transform = require('readable-stream/transform.js');
Stream.PassThrough = require('readable-stream/passthrough.js');

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;



// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EE.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EE.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

},{"events":6,"inherits":8,"readable-stream/duplex.js":13,"readable-stream/passthrough.js":22,"readable-stream/readable.js":23,"readable-stream/transform.js":24,"readable-stream/writable.js":25}],28:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

/*<replacement>*/

var Buffer = require('safe-buffer').Buffer;
/*</replacement>*/

var isEncoding = Buffer.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
};

// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
exports.StringDecoder = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf, p);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}
},{"safe-buffer":26}],29:[function(require,module,exports){
(function (setImmediate,clearImmediate){
var nextTick = require('process/browser.js').nextTick;
var apply = Function.prototype.apply;
var slice = Array.prototype.slice;
var immediateIds = {};
var nextImmediateId = 0;

// DOM APIs, for completeness

exports.setTimeout = function() {
  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
};
exports.setInterval = function() {
  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
};
exports.clearTimeout =
exports.clearInterval = function(timeout) { timeout.close(); };

function Timeout(id, clearFn) {
  this._id = id;
  this._clearFn = clearFn;
}
Timeout.prototype.unref = Timeout.prototype.ref = function() {};
Timeout.prototype.close = function() {
  this._clearFn.call(window, this._id);
};

// Does not start the time, just sets up the members needed.
exports.enroll = function(item, msecs) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = msecs;
};

exports.unenroll = function(item) {
  clearTimeout(item._idleTimeoutId);
  item._idleTimeout = -1;
};

exports._unrefActive = exports.active = function(item) {
  clearTimeout(item._idleTimeoutId);

  var msecs = item._idleTimeout;
  if (msecs >= 0) {
    item._idleTimeoutId = setTimeout(function onTimeout() {
      if (item._onTimeout)
        item._onTimeout();
    }, msecs);
  }
};

// That's not how node.js implements it but the exposed api is the same.
exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
  var id = nextImmediateId++;
  var args = arguments.length < 2 ? false : slice.call(arguments, 1);

  immediateIds[id] = true;

  nextTick(function onNextTick() {
    if (immediateIds[id]) {
      // fn.call() is faster so we optimize for the common use-case
      // @see http://jsperf.com/call-apply-segu
      if (args) {
        fn.apply(null, args);
      } else {
        fn.call(null);
      }
      // Prevent ids from leaking
      exports.clearImmediate(id);
    }
  });

  return id;
};

exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
  delete immediateIds[id];
};
}).call(this,require("timers").setImmediate,require("timers").clearImmediate)
},{"process/browser.js":12,"timers":29}],30:[function(require,module,exports){
(function (global){

/**
 * Module exports.
 */

module.exports = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!global.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = global.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],31:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],32:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":31,"_process":12,"inherits":8}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const controlcharacters_1 = require("../controlcharacters");
/**
 *
 *
 * @export
 * @abstract
 * @class PdfObject
 */
class PdfObject {
    constructor() {
        /**
         *
         *
         * @private
         * @type {string}
         * @memberof PdfObject
         */
        this._compiled = '';
        /**
         *
         *
         * @private
         * @type {number}
         * @memberof PdfObject
         */
        this._byteLength = 0;
    }
    get precompiled() {
        return this._compiled;
    }
    /**
     *
     *
     * @readonly
     * @type {number}
     * @memberof PdfObject
     */
    get ByteLength() {
        let utf8Encode = new TextEncoder();
        this._compiled = this.compile().join(controlcharacters_1.ControlCharacters.EOL);
        this._byteLength = utf8Encode.encode(this._compiled).length;
        return this._byteLength;
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof PdfObject
     */
    compile() {
        throw 'don\'t call the abstract compile';
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof PdfObject
     */
    startObject() {
        return [`${this.Id} ${this.Generation} obj`, '<<'];
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof PdfObject
     */
    endObject() {
        return ['>>', 'endobj'];
    }
    /**
     *
     *
     * @returns {string}
     * @memberof PdfObject
     */
    compileType() {
        return `/Type /${this.Type}`;
    }
}
exports.PdfObject = PdfObject;

},{"../controlcharacters":37,"util":32}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 * @export
 * @enum {number}
 */
var PdfObjectType;
(function (PdfObjectType) {
    /**
     *
     */
    PdfObjectType["Page"] = "Page";
    /**
     *
     */
    PdfObjectType["Pages"] = "Pages";
    /**
     *
     */
    PdfObjectType["Catalog"] = "Catalog";
    /**
     *
     */
    PdfObjectType["Metadata"] = "Metadata";
    /**
     *
     */
    PdfObjectType["Font"] = "Font";
    /**
     *
     */
    PdfObjectType["FontDescriptor"] = "FontDescriptor";
    /**
     *
     */
    PdfObjectType["FontWidths"] = "FontWidths";
    /**
     *
     */
    PdfObjectType["FontEncoding"] = "FontEncoding";
    /**
     *
     */
    PdfObjectType["FontFile"] = "FontFile";
    /**
     *
     */
    PdfObjectType["EmbeddedFile"] = "EmbeddedFile";
    /**
     *
     */
    PdfObjectType["Filespec"] = "Filespec";
    /**
     *
     */
    PdfObjectType["Sig"] = "Sig";
})(PdfObjectType = exports.PdfObjectType || (exports.PdfObjectType = {}));

},{}],35:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("../types/catalog"));
__export(require("../types/page"));
__export(require("../types/pages"));
__export(require("../types/metadata"));

},{"../types/catalog":49,"../types/metadata":56,"../types/page":58,"../types/pages":59}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StandardFonts;
(function (StandardFonts) {
    StandardFonts["TimesRoman"] = "Times-Roman";
    StandardFonts["TimesBold"] = "Times-Bold";
    StandardFonts["TimesItalic"] = "Time-Italic";
    StandardFonts["TimesBoldItalic"] = "Time-BoldItalic";
    StandardFonts["Courier"] = "Courier";
    StandardFonts["CourierBold"] = "Courier-Bold";
    StandardFonts["CourierOblique"] = "Courier-Oblique";
    StandardFonts["CourierBoldOblique"] = "Courier-BoldOblique";
    StandardFonts["Helvetica"] = "Helvetica";
    StandardFonts["HelveticaBold"] = "Helvetica-Bold";
    StandardFonts["HelveticaOblique"] = "Helvetica-Oblique";
    StandardFonts["HelveticaBoldOblique"] = "Helvetica-BoldOblique";
    StandardFonts["Symbol"] = "Symbol";
    StandardFonts["ZapfDingbats"] = "ZapfDingbats";
})(StandardFonts = exports.StandardFonts || (exports.StandardFonts = {}));

},{}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ControlCharacters {
}
/**
 *
 *
 * @static
 * @memberof ControlCharacters
 */
ControlCharacters.nl = '\x0a';
/**
 *
 *
 * @static
 * @memberof ControlCharacters
 */
ControlCharacters.nul = '\x00';
/**
 *
 *
 * @static
 * @memberof ControlCharacters
 */
ControlCharacters.bel = '\x07';
/**
 *
 *
 * @static
 * @memberof ControlCharacters
 */
ControlCharacters.bs = '\x08';
/**
 *
 *
 * @static
 * @memberof ControlCharacters
 */
ControlCharacters.ht = '\x09';
/**
 *
 *
 * @static
 * @memberof ControlCharacters
 */
ControlCharacters.np = '\x0c';
/**
 *
 *
 * @static
 * @memberof ControlCharacters
 */
ControlCharacters.cr = '\x0d';
/**
 *
 *
 * @static
 * @memberof ControlCharacters
 */
ControlCharacters.sp = '\x20';
/**
 *
 *
 * @static
 * @memberof ControlCharacters
 */
ControlCharacters.EOL = ControlCharacters.nl;
exports.ControlCharacters = ControlCharacters;

},{}],38:[function(require,module,exports){
module.exports={
  "Subtype": "TrueType",
  "BaseFont": "DiverdaSansCom-Medium",
  "FirstChar": 31,
  "LastChar": 590,
  "Widths": [
    0,
    228,
    293,
    339,
    571,
    548,
    785,
    638,
    179,
    283,
    283,
    479,
    536,
    243,
    359,
    241,
    384,
    527,
    527,
    527,
    527,
    527,
    527,
    527,
    527,
    527,
    527,
    271,
    272,
    623,
    547,
    623,
    473,
    871,
    652,
    580,
    683,
    704,
    535,
    510,
    706,
    685,
    271,
    299,
    622,
    497,
    826,
    684,
    776,
    548,
    783,
    598,
    534,
    522,
    670,
    651,
    938,
    638,
    612,
    606,
    275,
    383,
    276,
    582,
    465,
    524,
    501,
    544,
    483,
    561,
    514,
    330,
    551,
    545,
    257,
    271,
    496,
    266,
    798,
    545,
    546,
    561,
    550,
    376,
    401,
    363,
    545,
    482,
    743,
    523,
    493,
    476,
    330,
    234,
    330,
    537,
    228,
    294,
    499,
    549,
    629,
    612,
    234,
    491,
    559,
    559,
    398,
    488,
    627,
    359,
    559,
    523,
    361,
    547,
    365,
    328,
    543,
    549,
    593,
    270,
    503,
    267,
    445,
    489,
    685,
    731,
    714,
    456,
    652,
    652,
    652,
    652,
    652,
    652,
    895,
    683,
    535,
    535,
    535,
    535,
    271,
    271,
    271,
    271,
    725,
    684,
    776,
    776,
    776,
    776,
    776,
    470,
    781,
    670,
    670,
    670,
    670,
    612,
    549,
    565,
    501,
    501,
    501,
    501,
    501,
    501,
    793,
    483,
    514,
    514,
    514,
    514,
    257,
    257,
    257,
    257,
    547,
    545,
    546,
    546,
    546,
    546,
    546,
    535,
    549,
    545,
    545,
    545,
    545,
    493,
    561,
    493,
    652,
    501,
    652,
    501,
    652,
    501,
    683,
    483,
    683,
    483,
    683,
    483,
    683,
    483,
    704,
    645,
    725,
    577,
    535,
    514,
    535,
    514,
    535,
    514,
    535,
    514,
    535,
    514,
    706,
    551,
    706,
    551,
    706,
    551,
    706,
    551,
    685,
    545,
    685,
    561,
    271,
    257,
    271,
    257,
    271,
    257,
    271,
    257,
    541,
    520,
    299,
    271,
    622,
    496,
    497,
    266,
    497,
    266,
    497,
    327,
    497,
    345,
    518,
    337,
    684,
    545,
    684,
    545,
    684,
    545,
    549,
    776,
    546,
    776,
    546,
    776,
    546,
    929,
    854,
    598,
    376,
    598,
    376,
    598,
    376,
    534,
    401,
    534,
    401,
    534,
    401,
    534,
    401,
    522,
    363,
    522,
    375,
    522,
    382,
    670,
    545,
    670,
    545,
    670,
    545,
    670,
    545,
    670,
    545,
    670,
    545,
    938,
    743,
    612,
    493,
    612,
    609,
    476,
    609,
    476,
    609,
    476,
    508,
    534,
    401,
    522,
    363,
    271,
    542,
    525,
    399,
    523,
    452,
    472,
    480,
    550,
    610,
    670,
    782,
    549,
    660,
    465,
    930,
    243,
    243,
    243,
    443,
    443,
    443,
    547,
    556,
    461,
    954,
    1115,
    297,
    299,
    155,
    660,
    495,
    826,
    782,
    661,
    558,
    670,
    771,
    628,
    487,
    155,
    270,
    685,
    797,
    366,
    541,
    547,
    626,
    626,
    632,
    293,
    449,
    686,
    574,
    446,
    507,
    486,
    546,
    571,
    450,
    435,
    563,
    562,
    255,
    269,
    513,
    413,
    660,
    560,
    617,
    448,
    622,
    484,
    439,
    428,
    554,
    518,
    738,
    520,
    494,
    491,
    507,
    507,
    507,
    507,
    507,
    507,
    507,
    507,
    507,
    713,
    546,
    546,
    546,
    546,
    546,
    571,
    576,
    576,
    450,
    450,
    450,
    450,
    450,
    450,
    450,
    450,
    450,
    563,
    563,
    563,
    563,
    562,
    562,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    255,
    269,
    513,
    413,
    413,
    413,
    413,
    433,
    560,
    560,
    560,
    560,
    617,
    617,
    617,
    617,
    617,
    617,
    617,
    617,
    620,
    737,
    484,
    484,
    484,
    439,
    439,
    439,
    439,
    439,
    877,
    428,
    428,
    428,
    448,
    554,
    554,
    554,
    554,
    554,
    554,
    554,
    554,
    554,
    554,
    738,
    494,
    494,
    494,
    491,
    491,
    491,
    690,
    848,
    486,
    293,
    437,
    553,
    546,
    475,
    446,
    502,
    398,
    995,
    517,
    322,
    457,
    427,
    504,
    433,
    503,
    412,
    506,
    487,
    523,
    321,
    459,
    420,
    481,
    423,
    476,
    393,
    461,
    476,
    642,
    870,
    562,
    869,
    823,
    631,
    650,
    699,
    681,
    663,
    672,
    636,
    624,
    626,
    717,
    611,
    351,
    406,
    406,
    524,
    543,
    542,
    525,
    550,
    559,
    523,
    523,
    472,
    610,
    452,
    512,
    634,
    562,
    589,
    853,
    881
  ],
  "FontDescriptor": {
    "Type": "FontDescriptor",
    "FontName": "DiverdaSansCom-Medium",
    "FontFamily": "Diverda Sans Com Medium",
    "FontStretch": "Normal",
    "FontWeight": 500,
    "Flags": 32,
    "FontBBox": [-150, -224, 1071, 920],
    "ItalicAngle": 0,
    "Ascent": 694,
    "Descent": -208,
    "CapHeight": 680,
    "XHeight": 440,
    "StemV": 120,
    "AvgWidth": 430,
    "MaxWidth": 1115,
    "FontFile2": {
      "Length": 64442,
      "Length1": 207816,
      "Stream": ""
    }
  }
}

},{}],39:[function(require,module,exports){
module.exports={"Subtype":"TrueType","BaseFont":"Times-Roman","FirstChar":32,"LastChar":425,"Widths":[250,333,408,500,500,833,778,180,333,333,500,564,250,333,250,278,500,500,500,500,500,500,500,500,500,500,278,278,564,564,564,444,921,722,667,667,722,611,556,722,722,333,389,722,611,889,722,722,556,722,667,556,611,722,722,944,722,722,611,333,278,333,469,500,333,444,500,444,500,444,333,500,500,278,278,500,278,778,500,500,500,500,333,389,278,500,500,722,500,500,444,480,200,480,541,250,333,500,500,500,500,250,500,333,760,276,500,250,500,760,250,250,564,250,250,333,500,453,250,333,250,310,500,250,750,250,444,722,722,722,722,722,722,889,667,611,611,611,611,333,333,333,333,722,722,250,722,722,722,722,250,722,722,722,722,722,250,556,500,444,444,444,444,444,444,667,444,444,444,444,444,278,278,278,278,500,500,500,500,500,500,500,250,500,500,500,500,500,250,500,500,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,278,250,250,250,250,250,250,611,278,250,250,250,250,250,250,889,722,250,250,250,250,250,250,250,250,556,389,250,250,250,250,250,250,250,250,722,250,250,250,250,250,250,500,333,333,333,333,333,333,333,333,333,250,250,250,250,250,250,250,250,250,250,250,250,500,1000,250,333,333,250,444,444,444,500,500,350,1000,1000,333,333,250,250,250,250,980,250,250,500,250,250,250,250,250,250,250,250,167,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,500,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,250,556,556],"FontDescriptor":{"Type":"FontDescriptor","FontName":"Times-Roman","FontFamily":"Times-Roman","FontStretch":"Normal","FontWeight":5,"Flags":9,"FontBBox":[-168,-218,1000,897],"ItalicAngle":0,"Ascent":804,"Descent":-195,"CapHeight":0,"XHeight":0,"StemV":108,"AvgWidth":401,"MaxWidth":1000,"FontFile2":{"Length":57875,"Length1":87944,"Stream":"H4sIAAAAAAAACuS953Ikx7ImmJFaVYrKrCytFbQogYJGAWiF1mytyNbU3eQheXh4yMNDm90HuDZm8wD7c19i7Zqt2dpd25k/a/Nr/+wr4BXWQ2RWVgJNNpvsmTu2JNAAorKyMtw9Phfh7sEhjuMs7vhf/zdO4J5cu7ncu1nawn+hBv6X464+f/X0649dbY7DF13mOAl+PP/+uxr8uPvF1xwZhn+dj7/+5BX82ufp3/TfC598+fePn179/jnHoTNk8NGnL5++ePbwkHyGQK9a+xQGZfhddDkkijDS+vTVdz88h5EsuU6c4Th5/MXLb17jZ9v9lkP6pzACv3/51fOnKAj+wSE3h6959fSHr0UYJ0+BsvfgXrXXT1+9hD9v1+jYDxzHf/T1V99+dx9PZcihPHkKzfv6m5dfw68IvuMUEBG7n0BfqJB5xL/IZBdqy/i6dp+OORx+fL6J78ifxR8ttsk/R09fwM/x9Xv4ju3mZrF+v44/tXlQu5fdhr/wH4cO+2MR/7UA/yxyPDf1gWSGaW6Gu53DD8iN+SLaF7lXnMnJHDe/miNPNRb8GX6fTIGrcx68QK9N42s/5zSYHx0iz7A3RvhdaI7MHD/u3liUzbRABleyjU630xkO1vq9IOPLiiw3R00YIYOD4Rod9xV8uahJqaAaZGsFW1QEOaXxuqyYfLZYyfGLGuLFIJOt1oIgKyD8cF8GV+cGH3mCIhYWFltqWmcThVlfwa+jS2S+VW6P+5DOF3/DHG5xa9wcm0M0FHA6JcGYX0FjGVVr9T0JXsEXONGUyZ974cvRvB1KCVkP5lbW6PCK14RZDjpDMvvRWq/f62UDQgNfzsiyMvqN1+EuGZgbDze1eIHnRcHM6DIvElK94RU8S6sbiIrY2jfTPo+Q4LvmfgsGgq6N3vwS0EyC9RbKSAkYDz9zaMzn4dtATBxyEZFkx/OzOWmsWPlCuVKXgVLrnM2l4OWxYpjFUrUmj2VekjVdIq/B3RkNbUrDVMoi9yDvNyNSupSUYjoTCNGgwORKVFQmVyjTVECS8PewT777CvmG8X4Xvkf4gV9VN6vwo75Z/+K7zOvv6V+VzcrTz/wXVFoy8O0jexRfmyP2PTUwWUiAegv014hefW6fu0YpFhOqy4CSW9Nydpk74pqYRkKPoh6M2Yw2Y0110/MLg+G+Opb9am12DlOuzimxNUjWqw38KYTCugD8OcSjJW4WLoXb8EMY8ulQlXPZew8o1flrKKLqLCO1snA4IbXLSO1XhyGpm2S5djOw8qiAZppDsqy7w34Q9N1wKY+GfXpNNqO48Ofa2nBALusOZbzyMz55ET+AbaxVrLzZGAWzs99ca6xezJueYru3zp15Ld582HC7fnYhDddpRSs3s9pWLKXZndM0sVrUsya+wca6Icn4F7/ulA+Hd67od++mDdnAQH7lCiq2HxzxEt+/K4/3BFmSPOd1xEAky+bqyuIoL2rit/C3UnXtklpe8FVH5URuh14liIQ/W9wD7muOcXCKu1nuKdVY0/z9G0Dk1FAWoOUgedVdrjEBXDZaAmC+Shj4ALGhNrcNw1PvzXEDsgjH/NfAZjwdGKxxD7m/TF9X4n7mPmFDDcr7GFDPMMDilja3rk5w7BPGfMT/HDIfNVGXcK9JWN6MhCAcIeiFYTzbI+wFiejhkdEIBfBzwGSAfDUb+H1UFPrt6Vux+2RjokJvBDdo8j/C4/yygj4EtOPdhVahoCOAMIR4XlH850daxiityHL29blaxUDkP7PZGuwHkiZ2sUhsPJXwoCDUfYmXRCWllAauZtTLmNRaNpWbkaT0iwvnhoLg/e1canbHs20kiMXy8mVPUWcqPJWKa/xrHv5TbVGEm0mCYpvefObgtSiaOyOn4Y4/t3Xy6Zpd80VVRBOguA5/Srokp1TVEWEaon1lIbfizdZXQbMpS323nT7/11sDM2ee/WsVXVpq7lly2rALD9Yys+n2CqDOHL0ZH6LOc+77iWSO+cuh1KzBoqeSSQUkJpuHZPD7cOg+9wKunmh+UH0wehZktjUtTTXALXZL4dlzfsw/xRd6MVRn7+2B0LWSyvLps+c/T4TsiMpe+Gh0sEUlT1j5hA8BXm6sgixQecFfcdnKxgQwLp5UiEajzpRkUhnDNyCoxIBp2Jd8cr/O5C4Zj2JUeBEIbIY8ECouZAq6pYDU6aWiELiZUaXZdkAabTed3pyZOcibvqJ6ZuXefqrmdPfPzZmB0TFsUeARr106GH1wZsbMGcXDjurruqcqWqsUQdLloXthUFnLG4GuBSDJmMO85Btqxc12l2vVZUyoDBLT7UUvr4POdzotKW+nyzlPkHidb/pBo+7juzpa0AIxOzy387Ci2nK2vOibQUqxlZXrexsbZ7OyKa19tqwXHbvuuDW7bPMB3HrrZjDfujHnz3iypWX2V9CPhqcXB1nRTXlr7c7SzDJm9EoIf8yuOkxYVZEJReRBQFX+TfYTfu04YTwJesBY/1uW08t3sn7IDPASRivk+cvcOPH8SqhVqTyXQZ6ZykfRBBB7WK48mUCWyi6D1xUUh7Cs0pnAH54O6mp6YKxck133zK6pe3p20dddtY2t9u/wPR0trTP7ovv93uZXM46UUt3FrJEzhj9/Ql84C09UJnMps7msJuZSILbAlIJhc0mBVULnkmIL0aLLcCXbjSvtUcDgnNG+8yvPjR9bjT/21lczrhw+9to/Pg0fG577LFIjuwl/v2C+iIDlAPsdXwAsYXKPxe2PPxHGQo2Og9mzBUKXmBR57zIAIZ3SJ1S+LFmp1rZ3btx8+XG0xlIRv5YZD2eHocBR1JjiE1VplACRCou/QEElkxmFmBIfViK6MYzCVhCTiIA4PBixGs3wlmBAdbsR0sUB7Ww5l92sGlpas8upQhPkPWUajmK1Z2ARqCIvgk4zFVnnUzYgjSrJqmLnDadgSqYsqKKaCvzMTlctr2VypcAyPV2xVLPkKZokyliDCp6DlaWvSZKGUCZQYE2Jmmy7qqgr5J7ol6wrSU5GlVRBUgQpneM1STFUxVrIAf5Z5a4Fek11ddeBqy1N1AS95LgtPy+qGcOpaKKEeMGxcqA0nZzopSTRyabTKV1xNSuvikpn0QZkxWsar2XkpwGenLYvaZJq2zIvIHgSNw0601REWcAyBP40HxDWmxiFxqIgK8JYQqpmiiApB+DOcMxAlgTRMEVwSTVdgJfGMC4xYVHouuVVJv8e2K/gP4B1C/4EDB1QwWE/UGXqzwP8HOvwy7dEEl+C8XZmag12wcQ7sQbBOCxhOIzpVrYsdWIRkt/oY8lKygkaUnJpUhMqaXpFcndTk3Sxk9ckJAm8KoFL7ZSKDiCgDKu11MnaRQ3uCE6zUO6nFIWaSkImWyiAQSNK6ky3tpVJpQmVuwTQygiBVbyELQwejQWwixmqo4jGwCEwCQTE6AvEn1/xgJLDLiMd2tuDy88dT0Ifz7k0N5yiVzIKQeMNX8XiDW8VXfhZ1CUrqAfZeoDF0gA9ms3k6o2sn5V5nkPHMVeOaiGYXQ/PTmRWEZphc2BPwjG4oB4BhRDERIdnooOEptdH2Ls8A9+HzFq8SgNbPJc7nvYXc9wq92xq9k9g7vPTNtcTQLt06ObhB1ylPh3H5ZOmfhtoR4fy9GHBT1id+HRt9rRmKOhvMuIzpxnf2G6H9334FLBD0dJPHz9+mtYURfeefrg+NBSBV7S1zY01HZBDMYbroV13pXO+XD7Xukanfq11rlw+37kCv+bRZ3tLN4Pctfn9L7/Yn7+eC24u7X0G8vFVLAJR4C7iKWfgW0JEo/nApwkxhHwBy6EVU80+U2fexKpkEiOhXL4g0rn3wVEduuCvYm+k0YQJD0dZFwzBTP37hT4yM2Deyxk8YbW7Tp/dRhkSTQCH0soixbIfMv62sxZDo+i5F7gnCU1cPgUFjmB+JFTCt8myIkOtyJZWqBYTPb88YWLhOBltY0IoAGLTubWV+nDCM+prYeDoxYxgpR9QCxq/Gwc2sGe1vy9Kxu7OcMORVDGT+XJbNuQzf1kpWwWDKc+MYeTsFP0DB2vOwve6WbLro42G7mvyJ/dk9OTW2uO2W8FvAd9ILuZFTJ35hOzf5D5LREnKhLOxoXNchztzgmjr4Jbo0xe2uV1ulg3VjpNObpYJhD4d8sAkW94NVX+XKN/hFL3imDqtx/E66U0sA7xGBgkPt4FlB515xo+GcxtpwxHtzLlOuu7sHliqPN8zilYJGyDfq2U7aLu6IAs6LCdbddvBwb6g6FopANxyOxXZVNDFVObqWSTwrd1WYBVU6fBcSpZWyk7VmDlTk8AMOzr4/CdelIKsYwtIFgHv9fT9NfBM9W4mXTfAO1AkjEBmTEYN0EB/J1oTdOJYSDk8YQMfgciYVxDRYHaIyGNY74ZpOzKGSYb/OBCGo33hKyIvyaGKDSVZZSzQJixgsTwKt1hoicatD1Hf7TfdptDH4x9fYVKzufAxe2z6NWY/GI4folvHLCqHiATEJe1saFtGYpUCLc0wZAMw5MxZPPNrJDqZkKtGpKVHbDGipRiirjOY3QBZigYdJlxeIxQuZdqGnkQ5pkMlTIAaJI62sjYc4TUKF2YxPmMdOue20ou3a5olW3h1/W3rEJS2m861HGCwVXIlQ1q4+O0Z8NgEEeEtFTet8kjr8CnMAP78bTAAjG4XnLrc5gqOfNaKAphsKc8E7NAthNQ7N+48SoM9gOMaiITXkakBMsn34UYgGo0EbUtgdP9jirr3gWIL02S8D+s4HxK8FAYdrKmowTIWpzngTDmp1GbBoZw4KtwJ6CNuWGmikwMmWLOhTqZ+mBIu6KlIkyA3JpGoHjGsyNz+Bv/kQNP7VcuqZa5/qureg7v3IvEDizuYdZTUnfXl3fXrxF3DaueG7uumK0vSq5feoNi7eRwzMmRGOYRsW5lb/Od3129f+SemgJ8gqc0dYcWGbBYYRnSRmaGRZdk8U4ZHeIspZhQhrOJSli1GtOAZLYSQFhkwUJqUHt3RqM6Wzz790Z4BCZLdeQd9Q6YE39/wt1Auq7qa9skCrPP1xLMuwiq/w71KAHmd20wCeYa7ErF6EZGrBqHdOMXtNHc9KQAjQCA6lGYwcn0CI102wxGb4Yj6cG8K/MTNHVhko2neE/fsRORHkf3MejbrzBbLC3Y6/WRDc9XbDzYaRqB/MFZ4pGju7Q/uP8EmupxS/MbBzvKeZXu7y5cXCk5ZB0zPzaxt9vuEk51h3m74hRkvu1I/uKLx6PbGYD9QTGnzTldP61bLa20+WgfgxnczFG+vv3lre5CfSQcreJ+tsx2kfFnSZW+7N3tm1BCwI8RzlQRfytxOyJWxUN3hiRlZwBbK9LqcB3PqJA+yAHxTF86BnWrFzCu8gTA/4UGoYNuTodAmCeMjoecySkTpGHNQzFbx43YnZedwS7j7TaNV4fn8ekn3tKsfpETxL08f/fJ//yta5hV9tLW+LCBeVEdbiqOmayaPdDnwUzeX+3d1ISiA43l3YFcsttnzM/1hor933f1W7/aH68A3u+6uXAcvwVZhiapeCqj6wXHkqBBSpoEu97A5WiUbYqc5K23qrJSS+6Vx/6VEKSjkY8Gvt/JpXPnEEH7blKPzq24P+gTBQI4O5LAfBLO8fsycVzLHNmjBbxIObJWYrrGhV1yPYHzSp81H2nLMr9NpLwP2n+rmVtnwMqPGQm9CjZjr61Xf7Pqe4vd6J0n0xbQrnOt4puoQP7jYzVkFrTxNsuOEW5wpZXOSCLaVNtOp7WRMl2Jpko6IY2FcPgd/KtwA5EQCT1oRqUfMUDzmT0qnarNYALGdaQ/bGUnisdsYbiHcxT+3sXe5e0y9TILzsLR/YKEQEUTtfA7vXYuSrElg3imqkHyAsaBqPLPvxpxEhJi4tswNCY03eIg6GGX4HxIhVtljhD8PDsg/p88ftNRY4gVZEdnHi3HI50/MX56e/6jdHkoZaViKTx1fsk1/RkTAszqTQMA09/GJrbr73F2iSsb8x6ERYsNC9ZPCTdd0bKgP/589BSgvgQJ8Y1rEwYn5XaI4KSx+8DsX/qg5YMHF0WiydTGIvLtYRPGUpRF/afJ1nEy0UFyEwEsQVTDREJJNUQYJGg4kTSotKTI4H4oJ1mbaqfhHC2bWUG21tW9LmmCoqqz4umzKVlZPZxX1RIaGbCley3Gy4j4Cs6bp+V1b1MTZswhJ9YyaksH4VD0LVJmR7uS3Dw0BsFyqpeGObqecqjhu3dYcxalYpe05zOvvKK+FWcLpZ9xfT3C6C0B0PWmDfAlglMj2uD+1VQEmI1F2XyUwCzidAjMnoRKHIGGJzbGLkal6HDoQjyILbZfKAzD744mvEMbe70xUp0glQkCPQnc+e1JhTkZWVlnAGDzOE9HA7EqQGfWJhPjJWE6D2T1YnITBRJLYEP5wc/mTLUrrmq7/P/+JLT/ReXi+1NJVhRccw5kvYH3pG34jlQpujytFDe/I6mf38a6s462MDVGQZQxhr789Do3hrRttgNrv/KxRsquDdkHzjfyiclTJYv/idnGAL/+3//UXu+7sv8paugfeiOJqqUAQZG2w5q1X+reKDo+D0tj+k3SFl3kz83Bkly23mT76kX7KF/CddXiJR+erdUMP7u0udjUteHoJZMjmuGgDdQ3s1U+Jzb0G+FcHIWCZaLUQLNc34QWXSseIKLmxJFTqayJ4u9WakNgDXWJMXT5hD+kcL1SqtXprTQsxvjkM1iaRg24dM4Gt6B6OnfbWoiU/8vo0ZJdt9wWBOcOlORGWC6w5fpYOLCEgTM5WbQynZgEsG1XCGwBY32DjTbMVs4DzXTCef/et53lIL8mOCkpP1sWnfyXb2bKf5vm0p1hq3tbSmlMxJxHToKQ7BpmadxylwrhATwJrYP0PwdhPrshvAJETbuFLTuV2MSnl5nBtdEUa8xVEhhvECSTeIj9JgUAkFkQXKjG+2rBMcwTOeUTZBlyYxAFxAgy5aj0KqbM3emAK56ZXZRj8D3lFkiL4+pmLk/3qHEPqfKHDkNob1uPQmonwt06Di52uF60nzOJGpwnrzs2MgvgybDTlBl6MLsoF6+XNp72yXTL2P9bszIunlL579QZ+zPq83fHnz+92YWXlx+ceazNBaeXSolVKAYZKmmgrmP4eqH3z/JX1DUtWBWRdu2Yu5ZsbHmoOSaSvKkR8LKd4Uds6u7thIjB1LDwnJCh6r39mUwWSpo24Vv874e2Ie5rgqkOwkiyS4RofMWs2GcubA6rXkru/o4keZElIkrg8XJv4rzVK8zCWS3KQouSRKbiKMgGaIUzGMlCy/JdZ79Ujs5gq9DOgZ4p4h/KjzbsVN6+l6/X6x+dUR/kGxv7rf6hvgj5UeUtVTCFDwlVXPxdEuQhvE8tfMIa0MmZOdfluNtdFWkRP+NJlRUeikCKrBVDGiaGMz82cWBWvQLFUiekVzIRe/UtwlqMQtx7KvweWhRqKseD5fEzaY5e14bJ24rI2Dr6wMY2SWVT19kQJReFxz89Ph8c7XSzioVR7rn9ChTgb1comER74UtVinBq5ln9jcefj2UHr+eOm6fHNARHBiugzMMkNSzhux1/ED1BwZCf795/3vl+qdXI2TM0E4t1m0fRjmtuCHa8aItlUFQISYzFotQVmyGLKhYFKuslBKWdE8WJm3XoAWCTVDq5illsbrnLJUDZ84xxo8+b0G9vAwxDlyww5KhPkMJgQ66abnggxw36RF2YYcOAAfUTfLJbpLt5CJuG+wXCUabJtYkzsEX97kVJrpTuzzHtC3tjEgSUHZ+gdNLVsVutidGh//dGjOlutHl/exJ+6WRQx4h90QEOTfYPZPovqbTVIBnXNGF1GHKM1CVfCFCmthVYbJLJJic0yE0W5UgViO5TYElailNiZCbF94vrSLZsipZlPEiow5yLKVomIU/obiMl3yKUmo2xrQlm2qSN5mUJxQlnmJ4qaYYaUDUmXzbyRxCPytFl1CUezOkNKsvVqnLgetst2ZxUc2ditElJt1EAf8u2dBF0NEvzorpOpRbHnaNFfPCVfcI7sVWCVM+YPEAnNKNz+NFx+A1orzO0UZucmwFoG1xvjxdFF4M6FZPZVdNlWlPA5z4i5MCFmmRGzOTvXmxCTZXzyW1GsUMb7YpnIcYhSGE7iazOW1kfktocDakznDUmKK9go1WajVDzbTOVNMNK2vpqdYXtCnfVMpmoKKUW1+EDNioace3jTmw22cbzmOxDY3q36Ephx+C7P0kgIBvCb7OlGWgI/XNBWFhY+f/ZPBr+8IKaIdWLkUkuXFTUbR6QaxqfNgoAwdHoxcI4QpojGoguQQiS8QE090e50hQidrQidRT0TCGPR8LNCDKHx+hjzHWos2gSNx2KlPieMpWptfkFMmCkMkVVVN/xMkFWSqKwhbDDOzS+oJ5AZ24kg5tHvbiT28Df53dvL19ZRsFFFy/RnZZMSYi9Pf4Z/e/zcegjOnlRniyL219leW0zjq+gr+C8sdvifLabeHmP62egUQoF+ii1zSqQ0Sqqxaf1knKKf0p5/Uj9NZp4e15u7aHY0P88ytWNWj+8JJRw3OLtV4cmTszIBGuoG/t8nDsBCiHkv4Yka4ePPIOYbeuBZdpJrbRIe67Kn78zMTrt42J9TqmFKo+snl1NiLyg2MxSs1QrLWrmt4fQcnQff2ilkQO6RoJvpTG0HVTcboen/wQ0nJVk4bGXldFGVTL/ggLljpotdTIZBHbOzsg6zb8Rk/zL3Hd4FXD44FPB+GJn8Et4Mo0LO7+yC6Arbe5fjojuWCuXeEPyfUn8gMOAvclPJcRo4O9s7u3uX1YgWRUoL3S+Uys1efzBkbhDCk22wjQmWNNVfwRl/qyDQ4AitxX0kJYnvZCGshXuw5ONlJKB0KZWeYaHx0rxvV1ym/fDMBb5VrAWiJro1/fNCja2DrWq3j0qb2A19wFfbxKD2wLmSlGqZQciCpelpGFMcc7kAXqzX0D/H7tSwKUwpCEzp//IfH+SAVb6OmI69w/I+XrPwGFi2hN5imOJxTIwNiwobK6QQsjkQy+Bkqq1F9atKLgtXCtkFCrK5CbIzCRRVy47KJuiiIQZG3BhBnf5cd/cv387nV44jowMVCB1EUt41UzXaz9DxtJFBZyc8JrPrhlgqETxg87Miq6CKh/DOQ4WJmNRsdbrimG/EZwi4misKY1l30/mCRF5QcXQtPk8FNfBb5WimGpMvgA83ncsXitr0fEOpaQrwP/m7Gc2973l94fHyTJfNfKuGZ4MtW76L8WRjJkwEOY50vCcVtwiolCe8Z69iEfrL1VUwGoT5DwidSgI2GhRmKZjH05ZCJ6SaGjqz84ArtchKCuiQATYuQyWN2a70RkAdm6zLcqXdEcdCqcXHqYnxlkYwsFg503RUUalcabU7E+XD9rBlVbPdtBQREW+WZtwmitOOqv5hH/UpGQnKCWhxERsUF0LaOVlDD3DJD/qFX+yH5ENIat9mhMCp3z/GCZYOZImQrIqu3u6AkE32nyOqmYC+zxIuqZbIrIOhEslRmA7ftsFXCAhpsFdh0qWUijSRTElDg+rTsVozVWXrSGpMYnJhIKeB7aAmtYPQZ5FA/PTTf/lX+IGty7+dlw0Zvs7jXeabVlyo4l+tqSQ1wP8pV5Nj7iUpSQA8XzvFuZRIfHosZZqtNZEtvJexhUcCJ4144CQRcekndV2XrWMwk/gCfWMuykPDfgo2NaUTsRQJvIv+BJDyjJC5QjEeSolZmg0gY8KMz7onA5gOUnFOcSalWlLt5TXNUTVHa4U2TqaMZc+qOOZCvrG+1ymuWIFH5e7249bANSypWqIaYb0OcifOrRE1WZNYJSYYl6q5d7C3baiClg/l72okfbPcNveXhPRlSSXF1NAKMcYjcN8OvaJE8WEJyE18Wpq6wLHlGxoXzAUS5rYnURODElIo95ltIWUaJKEYqBe31eMb4OwLyaGQ9kKxxfeQDFlJSdjw3lp2O97WMyK68M83Z/0ZT/ANXkQmCPujs5REkRhHgo1XLhodjkTbxNT6IS60vxzjULLBy0EKibzhSaUZJFQTkj0t9ZjqbsxaaXHDUyS9QIKLY0lqd8AomdY6RNL9CUk9omtjQ20Y6iUlvUPTmkTVaIGNz9O04bj6LRyfcKw8yiIx7fcm9h9z/1WOVzXdaFGMxYFf4YQdE48mEh5lgml5nyRArVfYLthOrjZEfmZQ2Hy618nOYzRxuzgDdcNbyo0ebDZy86mZAIyYAX5zvw2KSpiltn5Z8pEomxev7R04uk7qSfM8jxUaAsHfuri1biiCFeAps5qjaHvtLrYZY/R6CXK/ntxdscLsvbF48c5d4Th0/rkokhVRuxfl/SBGVn4ad3FAVr14/c7dSUCWJfFJ5Wboxq6gyBNtNE/bFmNOqu9nmt3+G1L3SG5fb9rBxc8S5EGruY8uAGC0dy729MDY+xQh/ZMnpRXPqxi2jYJKVvbs3LXdjW1BkIwzl/W0trb/1SG8IzuXTpc1y8JbFiEXRV3aeIyWlpYOyoqptD+6oqTkzSeGJBueTlHJns+2dsZdXuRTOaOwuSgbUv3K+PYthNWHqeJaF+DNJPSeOyXaYJDMIWp5KaECSOxv2sAqJ1wpFvgCqucLLB9LoTvDOT6KnU2WgEF5JZq2c2JLSwZv3vMn3GLLADSBwExTsrdMrDGSjcSiNNiymCi+M4W1G9tuTuYHcs7ZvrlW3/M8j5+n2T5LN9iFNxbJ34M22YhnCjVCjCXi3xBrdJYaUSLJ/8O5aCz69xJ8Fze0RoPs4hI4NpncQnLJRxLcALJOWVAaLNVsbmFxaeLrMGwG/Xoct0Fje3fT/muk3SZm1GZL0J0vfnr9STol1jdQEUxSyTh/e+tmoKdmh2x+njLPkquzu7WNj271W/tptDHtyKcXcwtHC013cwfZ1xYFbK87CSotEP+desDuZAssFAsJ1yQDVRxvLkkVls+SqP8nRHHctBeFLvArKiOKFiMKRjuwx+n6Cx1BvHY9b7pODz9SrmLKKYyh2Ja0Mnqq5CMdFma3mnMZRkkCSCovLJRDAglwXSnN5tsudw1bQz54cGbW2OywN32FbA3Wk2rLVQth+kj0BSGkzyPuc0KfRzwVI9aAIkwkVWbn9g8ePpLH8sz8+PCBlKDRBkO17AlUS6GZ2bn58f7B4YOHjyb176HPZuXywjSp6FczqicTJr8yEvYzEfYRKnZjpFWmSEsUfwOMd/wZ7aqRbntm3szOe3ZqPssLKNPFZLad+RwSUXXDUUzZamCPulHFZXU8Qakv6qolW7UioJKpeHUHC/7PggzG02ye4hgV00J55cWgcbaBsw13ut9ug+89fIlrEh4s/7QvadId+HUuXTHLecH3+JQP+CjpIs1dxCQo3PDKOrjSwDqEHD/VYh45uqmkdT2tlmwQbBzZiVkLj7ifc8TLpruBLDVkEAr1+QsPH4FQnzt6EBdqWPu9ISh9PwxtpKN0rmuUj8LOdT7JSA2dO3/hCJg4kXaPMlFN+xkc7FBCRvpRqIPt5+Igx1oiyBHb48pG+8BhcdoKMK3O2JyNM5JWqVp505+vU/IYac1usMoTQRGq9ZQGNpxsio//JqoSLwm6vYwp6eQMdxY7Ya+GGzk9kwLmLnXbzd7cX9zsDNZ9x5HTJopKZybCaCerWiaYzwjxekYBLsiC7rJ0V1mXBUW0ClrOgCtAay0t/O//y+VdXRCBjbyatXfPY2s9U7MCYCwmfxDj3gb3LeaeNomTqFEpjFSprm8A78q10RTvSASSxU/MKDDivxmjypVqbbS+MeFauPTMqXAJ5ljMYBtGjFiNQ1ZwCjtAfec3cFChdUiJchGHwTbWfAXnGuaAsrWGKPAS25mVtIYvKuKE2kL7iL4yaiKg8twG/evmNt6lxTim+ZKpwFKh44qn+yalpRbtoOUweh0T9wMn7vOX4VUh1PiYYjJ1SixSFUejBQIdcknOGH6vyUAsNQExi1JRkmTbOZF2LAliuA+20u4r9SHCRPT9VVD2GVSnti2/m42VRcHX5wO94PP4xtcRerLphBE7m3+Kbqwyw4i949oQnhLPFKdmv0DzLBJ9PYyjpGmqsRIpd4wEAiJh5xwWpUhiSGgkx+wgghJsZhyKgs7k8WU/1Nb9TNPtZ9D8gyCNi7tFP7jDdMzPyNElDb/rqZhSDDcv9PLcm2vOJnxBM5OSxZiQ4sK6JHGjnG6h7zUFDYvWmeOoRIKWnCHir77gwvXkc9dyiDJXpZRxw6okTAHmN+WABsTLx4RiKy8HD5VmlGGF2qJlu2HKGrFcBsRywTbcsO82h41puvzX/5nQBD+HgGmC2A5EHp4yh2Yjz0Lh1uMWLMsbROFTCmFaJbz0ihErpAqKUcVrepguwiNMlO3jKFUSPukV+43hI773lADST8SVjpOESJY9GX8MzJR93OmAPsQKGFv1DLsF2Xz+udfDu0zhZMjsMtyI1rPR2bECGjUWHgClG1ZWWsmaNkG1wpKSZncq2atHkAdemyGAIygpJAgpE/dPMk02taciUtIm0iRZB8wgtjs8e3syd/JQV7nPTngRt8AbXidL5SyQv3Dt+mciGT1DQj9j/m44nfvcHaIqpyNtOW43yv2gQ4zK16PQEdtUXucuJPPl6K7xVGqchJwLDyIf4kT/B9b8IcqvYTrUx/XWmVNrZtlWO3yFLWomiSWRCYofo7pkSo5qBryoSYWD5szBzlZxv1PzwHMDrRe0QdxR3nM8CfGK4lzYub6F6wMCy1cpbuW6zkahU5J0WTYlWRPgTbZyUOiYINLlOm5QAIp+MC6lCvZutymBCubzGfD6JE3AhSN5V5dUUQuMwvy4Y1ewosq2dAUhrEM1R6ts+Kg1D+8SeR4XWyM9wJucnDDhMbP1z52SHFsjZRtjyVtcOicST4AwOX1KnYYF/k8iwWfMFXDW8HRC5CDaLWPRkpgCDgFW1A13ojo6DN0GbB2P3AHx5hs4SYxm+rj9SW2eP5UM6U2XrE4SZJWzRp2Xgdx8uuWlW2mJ51N6er11+66EVD344mmqka5v3Kp7qZyyMwK+IHF7Vw2MTItf45WghFxRlyVTZstbwkXU/7wkGZK/mt94IolKOY0wN1xfEoVz827DllPy+AtBVGslwIB8Yo1tcVcSJTPDeCLqcRgPdJIZq0ewQsQYDGNTNFie6Aa2QKIM8njmaLxgkcVEwpTRbnelM+xMp4Di57Nmnu+YhVT/9i+XYa5qWvM7Kd2WFDmbxSZ4RsaJwkgO2nrVKS4+2Fsb45lqd86LovPJ429/UhHPi7aqOKrhq26ez1q8xGdBrWRVzb109s5n6x2QzmJCOne52+FeSA+NFbPR3BvfloksrkZ+d4RMl8PSsinxXCSCN+Z34SY30P50tVlE3xKsA3zVjdDA7FH3YapMo3FuQt9VJrOdhcWVicwaISzp3o0YLCm0tqw7bJ6oeWHdJGKCTWqPe73+Sg8Hn7rDDjEgo+zuXsQT1QGqouJaBTwjRXRGC+ZKobX9063CnA+gZNQFsOlFvnPUksw27lEEChgvf2mzAf4auM7tnStLADS1vrzpiBLAiubpwg64X25JtfxH93HA17KoAYoFX8ukmNSXywhH+FdW4ab67bufPJZRvQj8S0p3jZtPVD+fA8vjpHy3Qb5JHEZozPOsVVkt1mqQXXaWNTGJyTw/M9EJykmRT6bAt+Mtg9r9KFcF38QRMn7+xs7NT2/1003n/FOVTkY5mtfS2tKOr1ksEIBvL/BKe2l2AytUxVjM14d//fzj176i3H6GXn9k8PxMzsjgULbiapX+6gEu7gOp+4VI9Uoo09h0oLW2t1itbXLZB5Qsku0sr+AM45QlENKEHo4W2m8WJ0ekYUmVGoLL8Rsn/gxr8iUEeT5JNVFWtUknvfgG6bA/VTxHgGIQgoSPM6nQ8Mcc2wTo1W/cELTUpetzm6QZj+1pvBakazkB/YSJzLKilmd5y0blTbRVc7Zqy1ebBc/nEcgXj6xsNydb8rc4lRgvvE4kTfe470LqTMnUDlcl2cNTMKpQgwpo9F1okpwDzTZMLvwF7hmXaIt1i/srdz407+5i8+4eTZ68k6wKLtH05unBHPdT5GyyoWvw5pfTQ+vc42in4QplmHTzzl3MjIg164w1Cy9fR533AK7jUWyyPRZvoobF+5QKkA7Nhh3Q35N5JqMMCtUlsZUa3ekOWCcrBoiXiwl2E+wbbafl1lIi6YWlAbCnZMWUJAWMIQs7/ys9Q5GebRYHmcsvtzvg5Hrlwt7C6o2e7uuGp6VKrlM0WXk3z2uH5+49PVyHoXzDUR3NzsiisIbEpWGlIku8rOpzLexHz+FPB6vcbtXXx7aMFRCvgGZWFEtK6WD5SELLtwrq5uW0pm7MNHYKAHCBj3NnOuv+4fzFqwYGRUFTZJHUDjQANP06XInjHaCuYI2nizhnHn+QYsprD2qelVO0xVxtIND+V1qshn4rXNXDMLx+C4weUk0lWrNzAm5SQQZTOIvyhJpqRDkzkYAs0bZ+kuD6W3jxpz0hob6WGAgm+hlgvVSsN2ZOJJ7iPBw37flbaqibyMY9q6TLxLMgTrG0JiYyVkJMFbSrrdlgvVrFzsNsFmwrrIxQcaOs2IrEF44WRwNN5v0a7otm20Ie26er60UcXdrKg+MoFumWCugXwEpBDIsZ2gtrtcwMxtdhUUF0hzvynXCteYQCrGL8Jeh5umeanbQICcLEsxhhX3DNqEUEG9I5m5gTeCd7LBRLyUYiAaWzYGcmuNmkhBbLneVT8tMKxVI8P41FgYDIEUEJsb0YtDKrwFmupXFDN1gcfsf3up5Ikhx3wY4PvGy5nPWyYNPbqIgp2c6AoDqSBUKvMML1moLF/yDokulXMkHZNyVdpIE0+tWJqDgPqBmj4i6l4pDun9LwyPybDf8XAF+JfT4L/k/Uh+I06bASKs2oaLkTKvYYFReGuxMqsmCpwM2HJcMuo19DYSQE+oXQFu7QMfwSTpL0FSEo2EhKSu1e7UpHTxubAbjFYLeCkuRV1+yY7jR9F9FPQFvAM9cokvL7EY4rlUqOz3sGvFO3r5CGIUk6I0yACBMuMEwQ/f0DgWnqW2DVnOz/YkUS2EHRUJvWKEq94Rq4YVJ/cP6CmJDMNlMddZw3NUVADAKGZceyz5lwmghHoNe2z547f8EIZTTab2pGBM6Smut+VGuLNxMaUVYeAEU/6DGN0G1iUMCddsH9rblOWbfk9tUZkbfaALhOzTLMNNb8akqpXL6BQ8ydLRzI8IAtsmpiQ4mv5PGIDU5yhjReqBdRZHI+4Y2GC15vCTc6U/EGKxIWr2BHcjWLDQmEFEUKm9HU0rxNc3qBf3jeee5RjjTAjWDBOwUWMAfUED+EXD6JASFN1dNoKqFsLlkwQaU1MumBYpmFulOWNQkkcebajFibJxMuzSanC18LOZ50EgLUE2ie2NNQv9zDC/MpXZh3WdzyDIxfpXM7JP0VsByN+U061OY2TvXb6YZuUAWT+wPq81jEcR/L/fMXH34kjeXehaNHH0rk8hVwuSglWLtmVTGsoDr+YJIqtkqJkVpe6fXPXzi6+PDRhx/RfayV0TQCZjOR4x7vrpPx/VVibGSzpBquT6Az7MUz0U9R6XfGDbdEhncoajpy83xDKcwHdtVd7amyn8rutndWSGc7N4dFBhzPWh7lVmaH7izOjmg0Kt3igm3Zc/jVygzOQpsJABfSGoDEJa9qKOqgpvh6unx12SqSCSFRE1M5EWFJFAPsC8FAc6OJ77AZIBBJHxNjdeQZusuwt2PBuNdjXI2s2s2QrzX4nqMMq7K6gFXM6k3K6pU3BF9oh+d8iBrrnEtTvcTOYCSMxfZwjVoNTa41jcMyDkcvTrblWcNVtdnuADyMlFMZN807Zg1MMWWSD3idcUTILuGmj0oqawbLZc3Xy6s5jFulZn0hWCkXsfHVLD6IyC5bKm6Ue83I6G5GEPV9HLBtlQSgah7veCz2y6y6pZAnbsQCjmyFW4AhXW0wqZ4l4lpCsir3PpgSYTsV0KnHoVnPsXBmYzLkTKWcEmsg5kWxdFPBiTr9TBvgfS/M36HVtlhZwYXPfpHk9Kf3n/743QtXcdTa6OLZ5fOAiDskLQf99MptpvdwXtvLR3R65xEv6Nfufgi/Xr2a2amtPcBzx0zsRjNfOaXWBPf/JBWWitPprvYuyiBYK1Sw7F+J6sVqoNZZEk/sqhoMhtFcnP1Edtrmoq51DCdEw8pOdHuNEaqzHtPt8ehHJkKEeECP1EBRsUqE9iblJsolswDQKipC60JLBjdE9bZmDp/xgvXJPXBpwURqrMFn9vxbipxaKekVJz8n6uZgVXW1oCsw8pWLyNULFjrCDUDSlW9fpIqpyz9rumjiFbFSTLtivcZQWrYUOy/r7vXr6rDS3BIEteaH3f0m/OgC3X6k/QTHkjsze4aGzIVkcuotAOAoH7M+kTw+GfsbA92LEd1NSvdUFBATKN0VDvH17vIkJZql3EddaUdUL/WiBdyMdRqdRKeEWJW4nwli0fDBYBV9uqaIQUFQsfJbr0vgTrmjipJSDp/CwEe5pqOlDQ+JyszCzkV+Z98opGRDzKokBl4TWPi/5ivg+Lt8C8d8ZUNyCuDOffkXLPiqIupsBxm+lGwq0/jkITgTh1+LEiC5UfAQznzCZxVcowljoc3l9foCSPlewoTFbXxPwGcBRaR1GfZGQy9giCZfbyDWzMTi1rjRNJpKhlsoT+yCEaW1uLa+IbwZSPtrSVu1G6tqzUT7/VgPXqZo6irptue10xJfXAjklFIo+elUWgWKSIYMf+tpWRSXMR0lTaxkcVElcRJcKaXItoLuz8zIPF/Oe3lDQSIvwgcpgamQEvFhBuCUl7NtrKNY4it6ROjw6ASinANESZSq7YAQXiCUeoRwz/r9yVEGVFQHdKhHsomTO0NXk76DBz51CC8PGJWVq7ceTqjco1SWa52F/laYm95MBEyxNXEy92+lsQpfcNGKrGBTdhpSEttCUXUb2rKdzSovoGpD4YF4kmN+CaRvzJ2dU9OqU7PtvAHGqCryKOUIsmj2h7IhB61SbnPpPELq4Z5bAltYlmS8i2OIaPPCKiribm1qRtccZQ9n2vTm1nZVnpfBNgZ/GNPcLKQa64gX6/VcO9XI749gjXR2gdEyqfgnbEEcs39Rlj8AEj8l/fxWVgWWno1DjGHrNWG1x49FvlCMRxNjlO+BrgumtR04SoVipQUmVUT9sL1amMHl4bjhJFQ0yoatKIbuZC8u+gKhz2AZe8nzmYKbU0WZT7k7dSBAZ22IBJh/YOqOilNIfEviX8aih6qn+w0wEuCl2hzfv4SW8C4XL6dMPa2B6WBWPEX+FsdnEjbBdmhr9RFrPnaL9S+i5lc2NL+CkFBr22HBZRh3GYvV1Z4QDVaSberWuU4E7BVKO7lcXVntTSwtlvomI0V3Okxs2yynqzuMl1gOo/SRqbxAmgQX7ROQWExhIWPkUvw8qLncvK7nUsXFZkBzdXDNUim74CtaBmcB2jO4SwTqWWpKFRWJvzmvGmJKESV9HevHWZ9nSRWyb1p535F9HNcv1xBLnCtWMSW8BG3XuTskK26dp90b2D552L9BqlRH6yRJZy0ZxWISZpD8m2Z/bbSuR6QK09pVNyyZC9MEY2VzJxPe2Kkj2VjKIAnxp1XJwGpcBYkSkaiq2nwOJC6YMY0ynnS6hH1++PpYy5rZTsljs7N509LyLK0wUwYjzMvkPt0AU6P/MJdNIcfmdU+QBBgQSHVqbrOy8SLt2gib+lzmOMqwJGR5iHdFaM3FfJiLhkgRAEkgRPMLu3sP5bE8t7gzfiAxcvHT5LIRPze/sLiys7s3vvXgoRWRzGbSpWWy5WYIiv0J2SY2FcksawAK4uBwVziZMziKDTXD1jEkrYmRdaXTHPJbP+km9mnhozRdIEFVXlCUh1+D0YQjqeAs4YUo65JsY3665V5ZSckPU56qZ0mPd4EPygjp2vUHcLWs5FyKabaoa/Qt8JX1yc1El0mhDxcJ6Qy6a2UUXcMcMDPBT5fdJuZSZzlla7yD4wQpHx+IkGfFv0ji3YrqmgIwhuRLR/L7JMSG2+ywHDJ6K0xiGItz5y8IY2lm/twRDcLMJnrjHYeZDGTvXPRv3QX3y7t9h4q7GyXNzDJxb8/Mza+OcabgRNzTlHe64Xr+rdt37j4Im8PEkgADsurBLvB7/bV4KmCTAMVUBhppXzhcGayG9deZWGEl9ZtpniFa+uAaT5SJICLPYCXWSE3JgL7ffJTOGpKp0MQ0XEbquSbeAktJi0HaoC0K/bohazyu/SjPkHQEF/dKQ0f/+ElQ8D6kpIuGgmM1giD6rNNlPi/xhEu6qdbTwCfDV8dNFZkaAoYiB/drwyUlCw64zqAeDUmQEMvrnuwLPeT+SpDnIU8jHgx5TsY8XoDJQtKZpM2tBw8BjLbv3E+CEbv0JvjL1vSCS6H+xubW9sHNO/cfPJyk54Z5zFGT0VNW2ht7vLJGk8llFuFXtNIob/FHgHdMe9MB0FcOlmpNWBa8IHmeiOObsuZImaZpmp6JkOaI3+DYMGn4I+qSnSP7Gjz69ireATYCcLdDKtrEmsGM+8yr24cHJRfUK48L8RFOIhHk1XJhXpbncZJiuoYlVjMFQSAREN4Aq5EXVUGUWKwD/AG3IlkWQb9ibJXluEs5xGoLaDQOd9SirqYbdr7GznbID9bpVRKleDdTtp8h8YLjhvvsUVahnCFZhfG21qwQAOHnHhQklAZpoUMX5vC5QQxTSAQALbRxP6nvMY5+gWZXgNqk+T2uhLqEPiJgXeXuYvPKyebwIQOKWhXJpuNprrTO6i6mhorRIU5EkPZwTXw0ORZTFHJhmTg5boKofdKQnfRhyISxlwbpW1EfDOr3rgw7ta2tWmd45R4GmeWBZfVxtum9np7awpsIazsWsnbw9YMt0+g9gFmxRNRoU0DETfjjWW0H03mIiD0vf/J5w3b44NL33ebhwYEVpiByiOXVXUL/YPS7Q7oiYspRMhL6cWEfkSlilZJbYzoQNHR2i+x5SpPnCVekHa1IoBMlGwtUrY2GzLYaAhlRN6RefXOzjqnH4/jSat+yBph893uGScg32E0JJiFff8s0EaEf6eRDPugQTMnhiYRFFO724RQW9vwUnxKhqDGYSthuDLsUJ/3Bbm8KQ+JIQnbQWiDGwWghO5cBCzi33qx2AAFQC4c9N1YyyzlJw/4yOBTZebc042Az57CHPZmepeM+9pk5nNndZwMiT+0gwyXDuLsw65MmHJAuaVdAYf493DrapL1LzhCn+H+w5mmn7BeNTg4xSf6jLdbw6URB2q9UfC8QyRKaHvgTWrDxjqDhPSk/U86kcBx1+s84JzFFMS/Pcw9IgOpNjKNMXqbZv2e4JcLkd+KlsHyGf5/M9AYTtk1aOkeZDc0/iY2tjbnZra3Z+fXnuTI+HkeQy7lyB9yFP4F95Rm48+zm1swhKthySgK7yy52isUu9gAwLs2yDmwL3IsTQZlvuB0wXU6mV2kJW5X0KiG1r/jwtmjsTrTHw4bmAJbCdt2spltYejFh4R3KVmn10bPnp7S5Gl8Jq+NHfYWEsejhrpNM3VEQ4w49faP7rq3dkDbbzIPJKelydxFt7haaJtgklgS888RcI8iC+ANXFPT83VrAPX+OO1m2GvBPpSfjcqQqPmyJ9wpuGrBS4jvv3iCO5n/xt4W/A18PQlfkINQYXW6RlSr//7HvGWqStd6b6u+svEM3NJz/ZloKLwupFNiuBqzSSRPE39cqjcchVgP8FF2WdFCTYP/yTzAXjyNXX7jBdcA5idboWEyXyrj/8hE3YJR+2w4fuIcH65v0eSwxlQ312EF7/24bgXT7U2GHKbMm2kxMGjVv2T0Evsq8IutznVSga66eFXURbB0/AI6gMtiw+vKsU3dz4KFImigZYG1ie+f3Nx3BazZrZruiKKiSibCFlDZASyApJZeXNc0AQMBffCotajLWs7EWJWA14QYlPe4sLmSjvOtRq2k2URHx76tvyduZR2/T3eQ4aeycGHjH/ieEvr9u8wjxUnDgxRK3z92KJz/tU16sk602ujLIIrwPCzVDhv4HKxpvv7VZ+5ul5fDl/wbn3rX6/Kff5FusKInYKbgo6ZdTtrffrSxpLHzxS1hj9U3ynOY/rVjpS8pk4ZsfTtRn/PcpYBJOVaj4gd9LWdOzN+jd91vuxDDjhI7+bylTP7w3mfrnvzeZOr0O8b3JlPGG8sb3L1OnFU+eLlN/+VNkCp/rfhzGiL7ivnxPAvUVFSj6Yf8+5ElpjvrvT4IeNn78e+Mfuz+/f4n5hB3SjG3CuJy8JlLyj0lRy1QZyksynihseTcBwnel/5JdkK+j05H/bCH6mgkRm8a/AzF6S/v1fQnZ8W8ave9f/H6XjfXPsOz7z8Eu4Qt80zHzsnniv34OwMiEKja+Tj7nL+9JMD+ngil9cRx6DZPoxH9fmHsX1/i9iev5d3Gl368E8+Lv9LpP08TfT0v0WPwWu6TYP6tzz7lX00I3f7Ky5Z1twRB02/Ahf0uGYPEv374ngf8bFXjhFSPDvwNRF34jOP8+QfgNAfv3D76/Fs3HaVWz0db4Avdp4gDVc2ADVKfl4zL3jGyyvXWAPzZU4na4R9NDR/AJYch/hwqRcPjoxBaNwK+GW7u/J5A/+gNNBzBp3iqaf/xOzQl+K5Z//HubFwjx4neCOzUAkv0TWhT/aCQPmktUxY+Fxf3Qgxwkz0r6c2rlw/24weaJSvB3qZ8fvTGg8E5V9Y/eHKh/m2r7f/tPJ5z+38WfQvJU8V/hz+b74c/4z+bPm5zzd+168Ab3+y05dHyqG306j/rcP9/UQiKWUzEGHFt6H5xgjT7oJ/1hRrRjXu07kR7lmdv69pSO3E9xir6vCXV3uQ9C3/NSSMtXQBNaF7EeDj0Bm+jNi4KYRfD+/VPLgv8cPrBKYfikP4MPb+8WvhOXsr/h9L0l85D2G74bKYtH9LimLLdIy4zSk0JXN17oOhbyiyFs1aJj7xj1JyXwGTQWgmyy/NWlHBFsZwJIBQZStc50C0xiYWZAQ1O+JCvgo+L3U5VGrP4d34oUvz94gz6YqoIfMQ2BC+DfFPtl+R+xVgKYakz+g7DtHR7PsPb2b0PMzp9BzIU/SszTEP40YsbA2wTwNifg/avkPAWvI2qiLqNllfvhTRLI0gTCVLfCH6dYmSFCLP3gdxAMMSQ+jUQoy0D2VykS4aoQ0aEGqIqP9dp580okVb38iGJlhWv9cTpUGB1W34kOwokatNOQ8DQq5bFZnKGgljkN5d5IPX7nrXDtmMSjNrmv4ju1OOMBjcCnpxkPb1s1PRa2v+LHwu07NAa1xR1EMSg6tg63PJhmxp9aXr1FuSRtP3r81ST29KcXXaN3iSf9vkpt1HuXKNEfqe/m278rBiTEi8EJMuFi8PUTtv6vF4RT4Withyg/T1Kh/liZeJuB/PzqHysdP30D9/jXCsoX36BDCWi8TaE5Ok2h/iqpY7QiBEnmwf8++q/+CfQf/Un0f2PT1TfTf/wr/Vjfmv6nOk2ncWDudwp77KSZMRjr7T9MadZqLiyL+QOEJlr6V0kLLzJ9/buIGd+Wi9PwNaHgMOzecwrBfgdZt8OjPV+Adlr+w2Rl7b3gtn8MP97K/fktov+Gk/PWzOAXfnOLKs6ffxL+3P29Ei607oIBsLNLDYBmdOZSOLYOnvDcH2YQawsmtc6cvyv+IR69087Qr7LsH++it9+ei69+l5Lm49XZBLe2uRuh3njL+mzKvt0boYo4C4Y3jjO8l6rtPaY7zl6acPvPr+R+YyD1d9d3H/9ayvMfKP5G/9cp4dVf4SZhEikJZ84y7dL3jiy+9D5Z/MF/CxYLb4zFvguL32BV/BH+Hp/u7J/C4TNJDqMBaLnfxd8xfzgxPA64vffH3AOmOg8nqvN98DYK7/5ubh4xI+YP8m4Slpji2Gvg1zXu2SlpHbOsQ/Y1xJbpfVhjv5OJdxBu+kLMnEPu6P0x8ZAx8c57ZCJ669jwO2Lyb9hNf4D/vPkblhQicYgvojX8FXdvSho4bgv+Z0zFXQWf0fqQhaganhX96Fa2uXDmys37z7SIE+sMPodbJ88oeU0ZtiI1WVUfzQmYdJxqnLJNHJYATh1dKcuZMKUABvtBrC01vTNtfUCvVJCcQShtgNZzXFFEpXZKMWU1bfCSYHqeiXsOpFVJk1PdKtaNvCCWvHRJxL13FKPaTcmalLxaNpVUu4RE0XWA1ylSXvHTecwg05PdXrGw4vKaJEiCICLeCzxfwAeRSQJg6dLAxR9v616p5Ok2vpU7WAJdCncWJCSAAHg8EgV4s6Tx7kqh2HPh0XGU6OZPWMtuEDLeJbwzwTad7q7ePVk50oU1enrliMciW6dUjrCiexr2onwMi0k8xkdPPlE3Qk1XXJOzffPmNv5e2N5emN/ZmSfvoUPbN5voYH5hf39hHleW47XxPZHGQ5C7o8R8LnPncARv+uEZunVPHpq6ljx24ojLcnU2xM5dk9DaznhimHepeAr1ubC/DDka1Z805BLi5nWU0IBhPnFk+6gveLEkBqIDliuzAsq5fsFACL0Es1rzjM5mUU4pqeaH+yBLoiqtNvqNBdPV/nZBsRUzby1gF+JbPeMaObM+qjd5jHnGXFYQea8QZPmwQzJYc4JQratpXbl2B7erZujirBaau9brHw18LBveJqyiQwH3T7h41LtZnpSoRRiQSI46Dl2nB9zzaXLeArj4YHooS3452c7rJpdOhrZL8P7PsMxJFy/99XtcJnzhiB4teaJCpk3PMOYSjdlL3N9I8PWYmWrTp4h8xiT01kRoWXRVqi/idKjw7KZMM+v78EXzV5SQuXGEwUwOcSmqNcVNwgYg6PQLXLJhP4ZO5IbUnRvEuxKGrXQQ8/AG5JC+Blss6N6PuBFYavlarrlg27iRm2VLphJstTrn66AxvHncUjtoD2ZxLpKBU1lM7csvSIfy767tHqKKVzbShmaJ3RkVH+IAxuDPlMF+QZEBU/IWWIWZQs5Bf10sypogqhheMptnMpafMn0kSjNZUGBBrp2FewYNvlRpz9A2SFhl8RIqfHiIFgVN1LPuj9+s45yZfGkmh88yzYgCWiqlG7pbstLdHJNAwFvNgUeRVIBe3/FB5s7B8JeRxP31VIl7ApBUmhaENW4+2Ut/Dby8z6aHXnJ3wS+YGurTs4FDF5//KyJv/ccpDTo8gMx2dOExzdfzACATSdIe+WU3OfgxaXmH/1SoSOKzZSIJDAO+oeMfii6WyrOX7n7GZJLUrfeyo2ltF0+0m7S8jVrakSsa2KBRwpSqREtsJs/+VJ5dNzreNp6DFw8kRBc1z+2t4ZO6DE8r1O6OVq7kC54v8jyu6qs3Kw1VFERRTGELoDXc3ARowl/5pmHoZ4+2Pqh4uNl/VgQBl0Gd4cMCa8X2MuKVgzvpiuF7P4qa5NVIOhVYJ8FqHmS8NO9adscL5mxU6J9HguqquWF7b2u4ENQcDZ7GTMuKKlheAZfrq56uu+rX1WsLy5cRCpqO28gsX9uYzxd4Fyv9lCvjGASgI1hUqdmOYkrBxoFVtguD3Me4s021XGzb9PP9toL4dt2qp9NNy8HnoHcJupCjwEHb9nJoUlSNsFErJ4UJRjWibo9Z0IeL9duk7OkQ5qK1a+vr19C1Dfjn0vp1/Me19ViX9o+jtVLgGmFUBJ9dmcfSeQDomiNGNirwY0kplhoiGeaS5/leBiM9StLA5/nmCyValphiraOjyJbHFdluVwDX8bQnS1gnjq+pMqsgdtoAO+FX4SwbbjxpNSpTEZ9YCy4tDKZGQzusWcw03abgUhGEC/fyLz588jVSNqoVvG+4ebC9OV6b0CQQ5tbRCvrio+f30aSksNcSA6HAgOe+tPfi6RV8SFxSyT05xfHpR9okGvK529NDT8CAIBEH/jGKOrh/dEoH9xJYyPeikOLjJ8mdW/WEwrrHFJZ1Yt9WRt3Nx0+YL9MfBr1VUtcZ2wGkCzsTrvt4Vi4JC5IWUon1HmHJFJy4TRPxxaqgpC7dNAJj6Upl2Sy5Vt1dOELqh5e6c5okFjwPt4riDXs2mzEVS5J0yS6ZKdcyYAFmu4NWq6WyjAzeX0bfuqPK8jVe0A/3Z3dKoFxg+Snpm5dlQ977NG9rjhwU83YGd8dIPdhdHXuGJYoyr8BClXRFxhaw1t85f9jIuBWWXYOD9OyEXj7kKTaAb4StSWnlfJ7iPJfUGgewDu4R46N/89Yjccwf0XXUi9A7Ui/eyWUNNgo1rEnNr/DwEc/Wy00ydhuxYm6PHEyFh/ZgCc3v7NK94e2kqTrHjHL85xHTGtV701tSWDKciWQIbEWxYu4QTaiq6EbGN3C8PWQ+EYP0TFOmEWTSXZ2c3RE1V18ZDPE3NVeyuP0CFgySzfF//Aul9r/9R/oTh5Z/+JH+/ve/0Z84S3Hh/GJjQzZlq6SPwdDwl2ZXtALtBgh/FjQVNwf+y3y7NleeRRfp+/5Pdu///C/o7+yOP9CfPxAZWljujoyrmq26ZRUwWTBvb6PnPCpZAiId5KwS3VyAEXz4MP61PzPfwAeZniYjV0+s/TW2VTCWSju7V0U2agPY7iXx80LUzzp6L90BYD02mMzNnZQ5D2ThbHLoEkmFm5IFLwJtlscv7OxN5wAhUrKfn3TRTuIriml/1r+RpWJ7fSU0apO5cSu91YD4z5nmxF4lxjD6J6XiRAYSjMdschxNxYrTVJy53J1/iKLz8lFzzsNBfkN3EZJXh+cOEDpzubdOTtBA//lfprlPtgYjxrNP+Oc5lfTGJb2JH31uFlLD+zjNXjDks+CTl1eeHF37ZNAAk7KCuOhI7j4sboYCBfhewRw5B5ynG24CwifVEm+FHrM15m+GWi8LCHKLqNLhPZ7lMJ7jBtzFyCL8gL7zGnedMV1O+5kPbkhjJRhcunz3nkz46lJ8kLVmZ3dfGstqqw0mHrMkw7RGl/Iy5cAd8Js/uHH3HjsgAQnNWFYH6Z7heazbm087H5GGjfTIDVi2TaGJ3FNfckny/bCeIW1VmP7kPdyNou5pnYAtuU/qWY017gaXoKDiC3Gk93Z8VFutVhQf3feVcrWHOISzMBtlwfP5ch1+DYqstSka+nyJnK4goLINDPR8JNjFyFk9/tfYmapT15TBRkQjNFNC9+4VZ8gRvh8Sqd4hnM1M91QjP6zw9FXCoNgxqWryENj4MalvyJj4lbSI41M7vKTBANriX4MJ1uYuhMHvNu0fUYqSWllniCcYKkKwwLGWKg2SytE+chhYyYem0ltFH9O/1ZDhtzOs4D/hMaHxLXD26eoRbt4Kg7bZqTYxHl0ETMpFs1AUxuLSnbsCcb8MYkiROd4kJ5Ts46Y0N/DxJLCw7tznWfewNlhXS9Prz4PLPiCXrW/xY3FmY5OanbP07BtyP4m+9wbrE5lCrKV1m6A7638SvrXNVchb8f3DNGJ3okdvUHJLovTBzRNhIL1SnZmdW9/Y3GKtyBDtTEQqoEhzolGm6ZPzSEhzohFtMTlS6sMRa6DPvKlQw+KXPUDiySk69YzUB6tXWMmql5/dBZlSzK9uLoqZjFTG6tRfvbx9tqJ5eg4nhPLuHA6ENzcCS/fI4/LI9DQ9Qwxv6qQvLPGDaGkRRNSOqhhBDQI3C0OqKlF3C//SccB7nzVrPv7D48UyNqPPfJ8zTRB+RI5ulxS1TLrfY+efFxQh7YarnB04Dtoz1tuGSEyOawJqfpToRiae7G2zSkQoGY70klq2zZUj2GRH7wjB/IliCEEvxwJ3bH2Q2ByzhEd9BUWWMELhLjrjFH7vveE+ncvqg8611cdreJ/3p+X7MxdWI6qWL3Zx+5p8wMgwyG2WVVshrW1yAf///k+khRh9MZf/Fv7Fz30/HPiS/rLdrNFfzn2MwwJPMKmKFQlF7WzOfNLGeg0WJ7HygHouDs+PRdUwhbEkpyyXunkKOZuddJtRNccV8RkbtkC20CSWF8nTM6vJ2MQJYf7FpFVnH+Sx7g37GbAJQWZB61QY8mF/5YD+Gv44QI+mB8KDzDGcECm4zHBEPHvhSBjLim7k8tI+rZQM+5KJuc0tmE2+urEtkqWepaaYaI/3AVRSB4d0GVtUVYv62XMwrJ6/QIc1dmyRcJmPeplNAohZKipGkMtXG6Rf76S5MqKTlzheuBwVP7KTL4b9YRf+YWGPLu6ivNpoRMkYiU68coO1UlbwmVeEdjjg+xxuOmSuqEJ/PHbyhlUhJyWSDaBqURSQwH//NYCaIFSzCGdEYNK11guPpt7ZnsfdBOc29mYuW1hHFecs1/U9ZNuyo8GipFeJOKyhOA7yPbWHlfOMdXnmaKNO9CgOf3Z4Mm+wgV+TDo9XgWpX6CYfhzuuzuMNUdb/6D6I1jimWWlrsjYQ3I+0Ghkak+KPqSQYaf/gytUJoPqU1qJi1cOjK8OzAUjX6sxkW24w7MqxWkAlViEYmaskeEC36Aikun1KUdMFYmoZy/CNVMluVoHEmTNtGDOrrl0xsSMJEKaYXrHogRJEonxvfrG8bEsqKKloecspxc7zKaBjRlblpRJYAKizjHGwGKBUPgVoXFzLN5eWmsFKHl7MzPmTN88OCo6sS+g6XgSk5ysiNgc4Do9DmzQ6020HwG9IiH4AzLj4mCfW5j7ZMY2B3w53ZSr/gVb8tsGbSBy1XYodkcGu6oGdGl51n/LG5JAeHMCSvHL9sRGxqMZQtbMVIuiJSmAW+2bFwNOVwCHzBoMTZcC4BjhZ/4vPirH8iioasmphpjhzWPjzc8tzdjWddnELWlyt6dopG/t0w8HqvCLwgq5Z0tf9mSANLqWgCjhKIBDnL51VES+mPXhjKuDrtcaMC15oNQ03SSmwPgDidMfW8UkSOH7eCnRf/SadVsX6FbduBXmqPQUk4yb1mHfkSG+0EqVQPk1UnQnJWtxzgDyxw6NwKG2fHqeR2IOrgZUS5ozlj5NhoNDBs50GWyrJ5LB4oXSfghBcOL7J88bR4d71q0dSdU4QlXoNVzG3ZmkByYVdLa3NnftgY+t2DbXrZiNd7SOxObNxLeYl/0Cm+CH346kB+VvcQjLe/YS7iYPoIMA/ouiqj+IHb0fnZ79g0cQr4YU5EHSSWCr8A3823qkhIvwTCaPE3jvmHkS6f5/BS/s8PiF2AjCh/vdYN9JY9Ve8lP1kzAvv00T7P0oibhZMnUeXbUcHHkmxhIFReOzUkH5MZtSP7/fwX5rujN8YpxcHtqIDAirFre7SUBOFxeXihQWEcp3iHLbPeC8LcmqkPxov9FweR9n1dDd/sJdSw9Pl+cUPZi9giXGBvdWiYquprKYbsijIqDTntPFLPC/XmnMtmXha0twoXbGKrmLjvnuZ0nxRS6vzo7xVSbvV1PJyrgjqBnd3FkRcGp+CxSJmguXtHD6rWUtJurrXyS5ayMyZ+19uzDTUtJYuC9jHl01RcGyrWxgaruYvYudPK9rFxaWSVdCTGZpdrggG/Cixm3sfh/Cmxek+mIOxdgkRqgXJWs4SLCJ9egmJKFiaRER0pnBSTi1UOEr8yJ+ETSjEu/CzfVum6vEj7y8NSBJlfjnYbx8t9r97UVgJNrpP4SV7tkiyKsMzDJyZ3PJ5WZFMje/+XH55liRK6joOZ1Q/HWOdrmmvI23hZ0na5MpdZgqiFce7etXfrnltB4MQtvY7iC7Lm9zH3C+hg3mTHp00MeUYYfqw0hI29itYPk+SdPbJ4W0Eqj4OF+TnsHY/TNK5EJVv3mJ0fvDk4wmdl4+nai69fhRdioJMmRPnRcf3yadOdZsOSrOv0Qn1j3MKXHy+sySqfAlX85uipCBxOJA0qbSkyLjw0gQ0TzsV/2jBzBqqrbb2bUkTDFWVFV/HAcqsns4qoBpEu1DLBtUgJWki6qiW4rUcJ5D2eBHZzbTftUVNnD2LkFTPqCkZFobqWbBYjHQnv31ogJvES7U03NDtlFMV263jkymcilXaxgSChxNyQVCrZjNZ8MMxT7HUkFN3Cd0z3Ax3FHKVaIxXQPWweyQOZlBWkCs4VoU4M2FZEKkhdiqxWGqEXXW96Ohv1pkBk887nZ4pjddlxeSzxUoOoUU5QZfCl7mrc/2PPBguLCy21LSOfjlleogA8WG0zXLzFCWyA5oysc1yI9lo+hZ4AdYpQDDirpEw7crqjZs4ZWBpWdinedmJlIEcrIJ4U02sM8ibIskNaz8uX5t4kZ1paUZK87RIKRXZyKIZhnLaHPVj2uL0DVvSq0f/QTFAdKX8tQvtOUeXDNH1cMKPoc42ZYRsEF9Bk/iv9C94y/KOdmtzMo/K6ZSLjReAX0tdrWv/xHeqDu52KyPmY8yW3bTE876rwHJQ4evJJqwHeMGq2JWdslO1j2aGd6se3lvNp0hTcgOuElR8zXMim3Mc7RlDCIS7y4WS+VWYr/skwgNWtYh/nfn/2vuS5jhyZjGgtl7Z+8KlSXY32c19X5pskuIiUSIpUZS4SKKkkdQkm8uIi4aLRpr15ovvPr+wI57DET757AhH+OKDw88Rvk7E9xf4F5xIoFDVC4cUn+ZbXozEQqNQAAqVCSQSiUSmJEM8kfKcUtLFjoNvs/RfSY1c2QutIsMRmJ5fsFT6ugTlbn+3bbrKs2hB/6BdLcNh26e2Q9zcz75luc7m+NNuDVXugLRo2TisKyMtDmfM64nhUTWNun2Grk91AnjVupoAczpxmzINocUu5qZFo4ZujCYVldb3uj0NPl+DR2e+bRRfPTyYyQIBUqNeH4zLLy4BOO2uxCnDkhgonKxwA7Yn9sQxnDSsRMoT202cblOGV8SppZTRJWiQRJ6JaK0U0f0ZOT0In3CS6Je68LIYMY6q3C3LUbdEEOO17BjyeC0MObQrsPolhRoiX4zWLy3BOKwTPurVT2Qbhc9jZf5tj2A1YpSzAs3SbpRM4pq83Kx4nzJjhMKZ7BiT0pwIYbVJQ5mzcMMbCtc1Z7Ldg2N86dgftzHMYjJP3SjpEp0Q+WKpWDwV8+mwZl7+/XuPoujxaG0qHY/EDeZX7Oo7Bh/TrcVndGrxxHJPkjLJ1hS3sf6P5aCk+lnDr+TJ4vLKEwRfwZfFFScJLEytIqZOSjFFJ8j4PyKebnXy+iuhkdbd5mjX13BX8vRLDn2VbBsA9plJ/PUyKvZ3Zf3+dtYZb2YM/zYYu6WFfHXqS7DEV6Gs2AWOu0VYT17y7cGFxcrtwaBpBT8OeEN/E5qrIaHOqA9fKrg76JSb6RKf69YhgwVrg+9BuXiTSfstR9cdPFez1KAQDsbtajIPONZhhr4zu/DUUkhr56h3NCc7+sae83Rzd8+IRrluLnc7wpFcur2XTjsA69AtxJ/JbqBS8FAmSoPDwyOmEIFtNqn3485H60O9bJjcA3TEYlq4Foa3f7LY2PATjK3ERBp3+ODPE/fAihVGuOpUvTHPB4k2vTHmCDiD2TBl6rMHSuvU3vP199MtfIPPjS4/YzMwaNn3t/Y4gGVBV4zpGoZMY3hO7Pxx04jyj8k9zRSU4imGlmYKd5/YCm+ync2lTdY4xcE5QZ7aVeiE7O4d6ZWyO4GyR6SvXBeXbStUSrNnyIgQELZDx3qKfSUB/yeR8q+9M/eME7BY7JV9IMCTFqR8MMH7gN4++fRlpXQwsFApHbzKL6N9KddWMp4rTFWittQQ05yypH4MkcA3xh/dGbgT9jb5G/o9nrj3zq6rJvzscfBOirkmdunBkS5vWyzJjvNQzeEZySUHgy4/o+qTzrCroVvRnIO5iR4gx/1i+5G2t7amHTgDGq6As3uhr68u7Q46FdX77fvQZHLgSU29M+QxvEY45XAHHi3R4FhTz2Iy4g47aDNVNc/cXGwyOfb2YAMe9D76sYHSlomOumDShdIkE8Ps0kiv8EvL9w7xAbVMqADpYNo0KN7lDmn72f7hiOhMjG0YGDBrVa+qVb1hrWKLq5bXqpAuc1WDNKjdNFxm62nYF8q7H/uJkXRpYhvpL8/XBn0qbe5Rtnc8VflyRyyYEthVOyl/JE+hUKFFOy4WR+RbIIKJ0r6pxabnrcUR5RTKIO0dnU/F4igcL3V0ZVdSKRFi526akU0CulvL1rl0JkFw6tD3AomGACw5jIg7mMjG/Q2uG2ViwA4DV9g4VONwcGKixuL19Ww3TXe2t6UmojUhlV6fBVW2boLBh+VKeOwnXX60vw3y9ZcnpU3FXBRBCFTh44RAFJNMjHNEJSSfQTmi7Dgx8Uft+OsPt5Vqz1YxhctlDrmbZhw3McDOiF2LpqszcXWO69F0bRY2rZ+ZKBF4+lCBoyoDyho9lrjSGjucfLfTspFjq6HKyLEzb2LcqKTd1Oj6qmPhZt0cWr1SBpu3Vcy7VnTVtF1hnIPB1itLgFDRK+UX27qkVAO+cYf89mt1IdOZEu5pK8fkFTm2Ng9NVwOTXE/+BNk8/s15rmHgQ7/MV3prZid1ZpQfuZLcFtkvhc4f4sB5S4D0wuprf02fzjdz1MQa8gd4fr68yXlklvIHuYe+xv8TKmnjWnEOOsgjS6EibJpqLJKQ2CJxmVqKbMERqlgtrpEsZzf1puaxceg6jcmcXU7Ad/B9XJ/IK+WbEd51KrfrXbSxqTmZGxu3PHYJsafm9flVq9+wHQUHqvaix8MR0TH60wPMd5fNV3tc9J8v6BWofacpdePMTXGrcOW8xESS46MRWFBQyvCRTDMtGMFN6a50RHMIIhy7iVsvoAKZRZ4/18I0BDuFFuDapJNJR8NUcUV0rwPoC093hN0RL73Otxd72wtegKK5DeAT8YSVZpc/c35QoFKAXmqvmURSs/xR9wNzS4foQ7i5g/YQe0WXe8xFSKbJyrziVl6SVjJA1kro91zl1vMcEHm74U9lgC9faspNrs+QLrk3J84CauHMgOgLbXz/OdeWi4vzwnGxQR13tIk96jZqV92PbYVjtcGtwXd1s5nsbGyr/10wFgu+69+KzWYzd+PvBmlwemNjenptbfrwXS3m2e5/F4A8hf6t2plsZrbu7eBWqLY2WBikF/Tl5NSrV1OTzGn1NEnSRrE/MGuu6Mo2d0rPtVXZx1EdNhuUYhPHNNh76y2c6b/Ktgob8v0AA58Fg6o7JOUwqNj3sBsoFsNfguXWWx7U99fZhWBQgP6qIO9jHpKZUbrhGuXzd5dQVmMagss8aQ6VBnGNpDQ2CWMelyZLV3bku5boqCfI885oc8uPVdSHEssmbfD+IiQPcN1OH+mTHL3gfTxEYV5Ix6GgpccZERO2bsG+n8Pe2TcweP/BwqIwoxkeGSolmJb0zjDiQroTZ6djzeOIpk9aJgPEP5EMAzLY0jyvHR0MLEd9wagL5jxPU6KpxwPkyoXyF3fME271w5TcyDaVB8OeOjXmd4XctZ3OMFPMzDTdY9mSxz+k2vyxcA0gJFCfDKsONbYwiMwWUGl3yB1MiqOLw8wippLuoa5EVJMCm+YOxeevH6bzjDImJfZGTXeWeEJNz+bG1rmHkgahctW+BvzWCMdhGxmumB8XSRB1vZhqvUhKwET6AKdMJbe2rkGtbSOjWgn+0l29gL9Udw/HX7NURbHwxwrlltfWLfyJUzC6s77hgSWySQoUNqfSXd09vRYK7XzWIHczwk66DMVtKDPxFGPKpXCbGZHLgP7sgBDMMYUvpvaVSz4YT8c6a2qTXrePHWHSI26mLh/W9ChrfD2Twbez064webY0ztMN4GEMPR53UVc02lVrLmKTbwthn8PJTi5SGKqaU6CopYlZLY32UuEOszPCTJuqdXdoHnUuGdcWr6G+6Ns8TN7MT4lHZ5oUTAS3J1fH7PrA8DlNxfF1ZsviuckmX/4Pm0svfjQdZa/IPz/niSm5kBYcsMcQBmQq/yz0iDl5Wjpnkk9GBZF/Z8615YZXIlG77RW4tQy1DIqlSNpG7yMlk4Clp2fTwTAVUAdtRmHEeUVz5TP8dYzI4Oqn1MKLrgV8/ptajQmFb2Q1RlUDwRq/bij/Gks0rK1xm6EYyBLsq4+2BwJd8XhXEKq60gDNUKUBmqErDdAwgXVHrL7fH2iLJEaCTFn91oZt2Gxz36Q4dARY9GzV3WvJZuGegrkl3Z8zKvaTfy7dLWbVKopeyzeFa9mmsIJO67k0o/i3kTcNCccIYop0S7mJUFiEXhGIpfuHRsenH5ob7Ddd0w/dNOPCVxIysSGilgoIojYBQRIFBNfnYCciL63jSgwaTCtOuKKoqoocJ93AoZSpX8+Xe5qIM2d25bkSSBhLcnHXimXWZXjn/K6KEtr3IntJIou8r5b4GmfGaMcdmBnbp5+a+mp8q3LBPCqegMnSZRXn9Fn9roTeSkrsXN149r0k1ZZL9mbehwzX4MLauumSvVIGNjg4VCYrY10mc9OMbEll7pogta8mZSsThORy1G5iDVkqi+fl71Di/QMvRnSv7m7w13efzAFh8baOBjyeRH33RMDpaq2nb67LIYGyipv7sGRVfIM54H1dsQYgX5p/dcqRDMWzuhEuzIbrmEkQf2c2kvRFupNs+y0OHbSusWvGp+lMAYIdeHO4gaJprX0+r4cu0emerV+9CjUc3qncw1+MBrrU3TQWSPQudNb1BPt6G6/LIHiCblyqQ7sCDbrLGa7xpwLT+4a7Zirva/SPvvS5gE7WRB1OT1tSlDDcejS9MRxI+ZPowAqoslNTHZpnNpOa8tn1XT6iFsVchRbFzD+kFoWwoPi1FCN6hFHFr6TOYtmMxpPkygZAvxvYaUmvZjTV7QHQ0XtkCGUXXD0hyRk4bvJwRou1ZtQZxcHFVVF5NA7NCYT4NrcHdYItgzOAC49UgZcn31QhvKpSMG4WZNYmWkoLZoDcmnht5LTH7kbDw1Gtu73BkMWhC2xrimrqG2ccKXPFNJKKy910dlAW2DK+nd4maEnOtI2pbPRwGPa3tfcpYbXOk2fqEAG2LJhrcQGb3cbsIGQ+vHmdYuJuy98Rm36UxjxrR75BY9iey1LqRDc0HUNiU3sijQYhkp7cI6pkLXxV6oft44G4f6TBUf0Q+1caKh+uOAn/NUbOv1SaDFbF+JmD8TNttxUsei0BLI1+6fgJmTLcb2EQ1PzbGj83M0v6paNr4XpPVV8+7PavNT7Acf8ZcD9nyi1mqUk7sQuEbkM9/42gurqJ6C9F7dUu+m5BSKtahA4BAZwCLEYAcMcV66oWwfP6TQ2vIvFZXpDclPvyAcy4mOEObmiCWRbBNGt7WBhD0pzQNySAhSqfTkPhiN3BEYevtC+Wqk4xQzOplju0I9fVlePQOLuK9tEW3HrLNcMKVk1MQnR+okkJKf+3qg10D8BjDjiCCLD3H7gsjsOD5qCf1v3NoWEyVxXfT/tNNumqD7608z4qYn4CaHcEFsF5MYJ1Tyg8ANOjvx0NcbyDIWjuwM44qNMVibYZmN4kpIcs498OGMEb0dMKUF1DL68CoBq8liZymPLRhL2n074jERUmuf+2o6kaXaoA0dW05/e6V1VNcbu+8GfUFx75e9YXru6X6SYKwakrKNAtNX4FT1iF67JD9CNCtO3vGaKmA6AbKlULMvavgJp9hecr6X29pr8Dbhk9ZO6X9gkuQqdCR7kLxiU/YJUw8xVJgzzjqcfiPb1AJ6O13eXLiEuTDUmXHGZEfYNoLF7b3dNr6Rt4ODC5BU+hbQAD1SaZKR2/UhqDyUOZKxcT+VbVHXj/4/FeqEZLjdOGiaSiex5sTKzF3DUdIyVjvEqPRaUBR5fY/IjfSY6/WR9qnQ3R8VyTFrEMd4Z6arsXu1uC+SnqX+lRI+PV+mspDj4CDkbtWsgxLukYBupYHQNqYkj5+0VBm03YcS3QRde+NXhv0LEtoCIYBq4E6995x77qwNQXdOwqk9etIV9lZgPABGzK13Hy8vc89wro3cY5qJzar/cEWs3H55UuPNkX8DX+HEpOHMxOH1uUXZoML7G4E8NkZJh9KkW0VhfTg2Fi2aT0czZnbrLTUkKVMH2o/AKD/ZF9uqKL8KzBlNrQYWVGrW/gPr6IPCVgpo1BX3eU9j+dplqHTdPwtzru03ubkzzKL19yJAdgrbQApDcrVfRz1VXpx0xV+jBTpfdQk3vdHB2FArjHT4eEgemcOfLF6Yqg3dm9wNwYsKVlkDOoOxCs18tBhwZlhwdyclTSWCN1uGryuZGNRmeuP9fho6hZ5umMNw8treAuUd/QWCtVUSXlo+JG9VpmYXHQbFm5MUVby6oYU5TWKSr5+Y+/bycRYMb9A7mF9dhmsl7CHKXgbZY+M/I86MncvnPZzDkhtdwgbMZmB0hYzlbVZkW2VTa0xDK70Aa7O97ZMTHR0TW2XdvogFGqGo21jdlsQtluh+SO/ET7XVrvN2p03evwN2QbGtoAlmwId1AdWtdNZspca3hNfe2SFrrKN9DYgauQTavDrmzHLKmgSSJsecSyH5WzmZJHg2kwgLY6WupgSOhuo62H5u/Ut3g1p+rT/Q5vWKtNA3VyaoZbc2xvz0J/aGVeBpoGDQ16czOUUpVwfTDEjBOaKnzYhM9i87CLTJXQhJ9Iq2kjlElroKsC+evSZ68wE2o4fbVNreZhjKp80VDV1MwVPNDll9oVrZLExsIMpL8SCmlJMlBmwzhexQz5GIxn8xRdQKAraKIrbpQoWuSGSjf7GI2IhMfTyS5K9ahHc2i9bMMpHK+JJJmBoMVAY19HO+Ap0OhRHYpiaO6mYDga8ip85JbOB1MV84Fq8gmqZjg0IV/jH0fLiDLmEJTF0dI2BD2Nzv1856f05x/SlknZvT1m6R0I3TN8Z5L8zGwPRmvr1BnNwUWJRaBbJWoFZdLAABVS/jBMrlJcYYr+ErJhwtgKFxXyqdXP26r5AsHS4z1c8pcolfyNwEQ7ItmWaC7qMKV9yrP+SyHXe/68vY/WD3Xy+7Y735111V1KeR38jAwwJRwmtAtrCebK6e0AszvZ7MlsMRUipmWBhqCAKDF7f1otO4mp6U6XOsuNrFRyFT5hxgxXcWoyVc5VCHNLam29xVUIM4u6NwRU9LKC12hOpkp4Df7pLXiKkilsAccB38+5jmh36vHjQKPh0qGvta+0a8vLSfZev5Jg+xjD3YyrSjVQGnRFa8ToGekWFk+7axUfmjGxaAIsEp6biuK2ryzCt4/hV742mZF1+EzTKJK29Oy56ZmM98h7KKKyJTML385y2jgofZgJjTeTNtrnSefSk2fPrWNFHQJMjS2dg2Yfj7cIZsOmEF66zc74ECCxMBYk8yE1oaQZJdPxh7kJ32aOHXhNrA4m2ODrBSCsmamlQXfMM70PFGfvXaI/HG7y+P001hQ3wv7alTvjk6qqe+49codco7Mnd5mnl85QqNHl86kKpdGa0oGoufXxt7S3t3eu0eF1ZN4sO2qM/DuPbnjCbi5K9nfFW6dm2oCq1dR66vM9hkdPLc9srFO2ePc6gcOm/+8/8/GsoC1eBpU32I9fw/xejsv7QONmSzExBXPtgkDvjPKSG8uyyMqMMsyTBk1fRTP6u8L2jsbcOgiUf0PelNZZSx5LlkckhW32Fl9yhOuOx+uvrDHwjRgZWLtMHeQoN5LZ7qEJk2NiKOcsuN2rSzna+9MD8AeZ+g1Hy8iQjfNEH0Sl+hcm3uNhE/ET/kC+mU2iaSDY7AyH9xDQkO6c73SGnIGk31/nodThBFaoJqAamndoxPAYsdZEbb73AaXOu9PBhMcbMnQ0yu7RWgTqaX5hgDYEdeBZo25XwDENr4gOdo7ecTJlNPjTUCnWW1+THqOKlkrVZmrSdbM5wHz2jqFpBu5V4lDZl7RcYWsim0Xh/grMH8H6AfVZtURvHxC2YCSqikVowJzugTVWammZ2FOwasztCV9BKSYVyECuLtzdjdT19cPqNVTfwN1ShXFhayvNWCGPbbhTNCZb22XhWaxcbfKt8EhKIjQlbc0yW8RoNNZuJY0pqUaHAlQszp3OBjnRwd9489paU54+YSBpjaz2TO12DLduv22RK1NBG2tHEus4X7QwGsl0XGB1KqglXPUBIxD//PP0x95kthYP0CsVDsTZhmw55DcBHEOlg2GTjCMrXM07m1E+cpi+E9/Onbb0i3ukcRrhW0bLZEdLvRwwGMNU7rVgXMdhrPZMS8vP7GwF8px4psI+gizdeqF0r1Y6Wqa+H1Ofm+62dnYvN79NvZq862Qnpbzvdwo/nu/4G3z+5iA7Me8aaHGg5b8Xub4Fw+GbHFemZ5tmoo16rVYbGWrqZ1bVHnvraqDTv+JgeMvOlhmGEQ+oikPreCpkr9x18vnF8nJ0Kpl7Jfp9E8K+k9yp0uvjXBHfEc62dXXfMeTmZ6BUdaSG2jY/Z5SI1cfD8iSeTOoT6kFqZzVDyuKAgzpxx5r1xV6n5vbWVDA8zKpyp7SqnCrdPWBK1zFL9Ra9VmXZbmdcDcYqxgBt52CajjbmaDTX+uQcbqI1Tp+eLK64Ak5XwNWaf+NrCni769Jj09mGfl8sDP+0TvTUNJzUI2E9OQbTEqVvnrUOBz0+vZlZDRwaS5WcelOd3um56UlgzZ11jItghLlNjoLhKn5D1kkT87LEMNHZNTL62ECJAz4IVVma+gAVZSYtxoBUlbmcSZJJ0ooIGzB9V4RJL/quYDkaOCZsR9BCYlxobk/QGhfC2Z3aOSnGRTzIF1+C50K2qyVuyjFK7DAySsRV6cPRMr09KQF56EkBXVcNJdQaDrWGdFiL1TgjsOzcUlTf3otoS9Dhc6QZezoYWXcYNf0Jd1OgrhN6y/CAM+iKtZnC4ViCBjVY6XgN0zeF7neGms52ahpqHv3scmtepuHY3xAKqSmpDedz+OsMd/DJE+dIU8uEqjqTEWaR91LKMcURsi6yWIV2JQSHe9862zKPQ0rOGA77yeQyK1ozQKZCOFb6FmGs9FJkDrrR6cGM0ipKQ7YWWbLSzO88R5pBVO3uPYsZFJ5cAJoOp8kMsiNsMIGPlGCgze6h0GH6o8xYhx7Qj09LiUxPYQfsxDk4uJjV+a1sl6IaqUSyy1sXfTg2uJQMu4KOZ599EXYSIihHBwyXaKOiM7VDX+yjrzFhP0fH/zbi7zsWYkaNI5zsaPTPD+QH0+MxT9Cxrrlhacg+rLaWKi4mOlScft1Za8oP417lDzM98dd22Wb/x7+KkAhfXdJ6uAxCqXhMFSL8btj+Mctumm44nC6Y5Gp8/kAwFI4wiXhdfUOCHTFNpVtaM9m29o5Odiymr39gcGh4ZDTHnFRMTt2Znpmdu3tvnh16Wnr4aPnxypOnq2vrG8+ev9h8+er1N2/eviuQre2d4u7e/sG37w+Pjk8+fHd6dn7x8ftPn3/48aeff/n10sZjXPtHrB9ixgkhpOSpmW7LdMlVva+pnFzz/MsaedPcmrZLqOwQBsmTXxD9DhqkDbSZDtA8vUcX6AZ9RYv0O/qLOUPYL/WGVzKSrE82JdPJbLI/mU9OJn9NslS4UukUC+FKK2kj7U+H0tF0fbo53ZHuSi+kC+lii9ISaEllSEbJeDOBTCRTm0lkWjPdmeHMZOaQDe4vvbKT2ZnsXPZddju7m31/KbeNUdrEYABsEK2lTbSfjtMp+oA+oS/oG3rMDRTfGgbhZDyZSCYRBuPXwqAu3SRg8C69gzBIXgGDJ7eCQV7CoJj9trz7iFHaK+9gScCl0MTs+Ex9qhVjAQx/hMtS1v9WxpiM7428Y05An9hq+f0/trW9y2rDvOd/+Q9/+Y9/+ff80V/+uaQGdoLgLd73i29hUkDcShF1sBUqW7s+h2tdtIT5ZWPHx5lCBu41/vZff/svv/3zb//pt3+Cu6L4ImYtkPkyYT1lB9/x9NqW2yFp0nx0+IzED3+tsPwqz1P5r1qJ8ufV8ld/evN/9IeKlEPCJJwC6De9qCZojfPKHK4vrZNskW38RcmJOOxy1bVbkbJXNd9+yd235IC8h3XJoTD+cUK+Ix/IKTkjF+ScfBQnZj6RH8hn8iP5mfwkS/7KqWvFV07TGTpL5yrS7wLtnadE3j+iy0CFZavpY7pCV+mavF8HOt1Fn9Hn9EVFXZv0JdDw1/QboGHvKMoIaYFu0W26cyNcIXap+9p8Bo1T5h65jtbThpInjRg2Y9haUk4wCczG6wxcb/1sKBKXWqWHXnLDCVmTnkKSzvZHeTeETshWAlPkUs65LPdr1faWktFhvYHHMKTLxBwp3H8DHrYm3eosmVLdsEpld/2Qi13clMC8MgyrIxYbgzTkw8h9arpMYnecKef2hVGFlpv0IpxBQ1afcHe0fOU6JnLGyFO4nkD9CfYO9otP7uE3nXOPHRgGMURelQSUbeJVuuHC2jEMQ8tCWJbv76VZHqZYxnf7RFo3CYgYr7ObdEI+Xjf37RLAN6M5E1FTDHK4oPYX8ouXxbfUUhOiKKIhGQxRPEbQ6RtpEPFl8d3861zwzYES+DkgJQzQR3uHImy0YacWauCxIchZI2rB7+b7ZBjH3SDis72Z9/67Zm9QGrnFIQFTv4DpdhmUrFoyNwjrrgztX1n+W/6dV4WuK0J0eUbGMRyx9bX79A1ps0QB1PquLA9V3vOWyTesx/AxAf2Ee7lK83vZ380xU1pfq/1ZZUgjRKOjwG/yuvCtti9i7y6U104cFSmdYlziyKrAWhrazOVKfLwR1SrZJd9zBtdKRc28p8cI/ySbuyTIPc1GPoyLZkUYG+dKwOIMJS/fg+9yiNaYvYfH4MKRuEw84jdk61Vpe1tso06E2GN4SSp+6+H6CNdduIbpsmznDHuOb4ORw8YxtqytEhuKraeVpHeLVP33sYnlm38/z5eGtCJeEr6p9h1/hn+Gf4bXhMglMfkU0I96g+3qsriKElQey8mY5fEyL2OTMsbrM3/9TI4E4aVc89jjwSvijViq1fTJBbFOGRuUsWEZy8nYmIyxVn6G37xMmZSxNaz9BYabMvWljL2WMf4Vrba2ZXAXNYOr3oyET0a+uQ2ft+HzNvm8TUKtTbaoTbaog/hlLChjrTJ2T8YWoNYOZm8IwlWZugH3nfjeTnxvD8Z7RNysp4dt4EO4gOEqhgwGvRKmvWRBxlZl7IWMmXDpkxDvk9/VJ7+rT35Xn60Eh2SfDZID2MoBbOWAbOUgpg5i6qAtNSdj4zKWl7EJGTPfPSRhOiRhOiTrG5IwHUJ4DCE8hvHdw/juYYnREQmfEdmKEdvTcRnLy5jZilGscRRrzMkW5VAPiceCMtYoY00y1ipjgzJ2T8YWZOwh1v9I3q/K2IaMvZCxlzJm4mcM2zmG7RyTbx3HFv8KvwGZEhQpjTKlScZYuc/w2ylTBmXsnowtyNgjGVsVtZptzEtY5eW78xJWefn2vHx7XrY6L9+al2/Ny7fmEVZ5+e68hFXe9nYTLpMCApOyFZMCApOyDZOyDZOyDZOyDZOyDZOyDZPy7ZPy7ZPy7ffIPGHKNksYrmH4HMNNmeOljL2GJ/OIvXkJn3msYZ45ioLwhUzdlDFW6j6Wuo84v49Quc8MikC4gqEJgweY7wHme8DMX8G1ieFLDFldC5hnAfMs4NsXyJIov4DfsCDfviBbv0BeyZj5tkWsaRFrWpSwW8RRukgW5f0jGVvBJ6sYXiKV4b85gCCrawnrWpJ1LWFdSwjfJaSlS1h6CenoEn7PQ9meR7LdjyX+HkusPZb5VuRXrWANT5C2PsH4U4w/lTU9laVWsRWr8smqrGWVvMInZs41GduQY2ND9soNifsNpPIbzMEYhA8wXMBwSeZ4hPePMVzB8AmGTzFcxXANw3UMNzB8huFzDF9guIkh+8Jn2Bc2Zcs2ZXs2Jdw3Jfw2JfxeyhIvZYmXssRLbPlL7JsvZZlXsp7XsvRrWfo1fv9rLPkav+UbjH+DcZbDHKPmRQSvU/Wp7U61xR/Y4iu2+IYt/swWf26Lb1Z9v/Wuq/7hM77S4ZYZtFPBs6F1XsK36ogbvtaNMS+GNYeE+Hrh+kjwkAuwY5OEBEYJ9wXPj0iQcIygU3HC7buSmJtwBU9UbCSkLk34Di5pgCcNu4RvwpPEMOFnwLm+CtqsI3iijpAWDFsxzGCYxbD9HbAvPwCz0kSYnhHphjHQA7X2AuPZ5yXoUBFYAh8wAFD70E8EWT1CRjAcxTCH4Th8SR5jExiihJBMDcKFsTsRuM7hwrvpGYLqw4TMQexunmBHI7gPDQQPw0UosQQj4+EOQRJDyDKGjzF8Ai19+gmGJcB4DVPQIyR5Bl/yHGMvMEQvw1wdjrweI6gCR8hb6JlvMfbOFhYw3IJadwKEFPFuD8rsYwy3X8h7DI9gjJ18S8h3ALuzLUIuMPUT4PYHjP3USsjPvxDyC979iqHZp6r8/vK7T7MYdpekDZbcvahabrLkrrtKzvYq+czf4ZK7ZxiGbCHfT4rYwqva78PwzQ3C6+BU/rtVEV5XYhXDlzfKC7D6n/9UkvKxMt//+u/WZab9739Xme///DdC/oXX1lvy9LzquxcwbMJwv+RJvmp+Xsschj9heGwLFyrCksIRK4njVsPwcUmmJdsy1UzDIF2SxLfeRm+FTl9FuHuretb/4PBL2/Pn75+/f/7++XuTX2rb+DREyDZGmb1QqqItN7Gd6hNx/g9ouNxk9cAdjyvEQZpFXCVJkhVxDfLcF3GdDMNyg8cNSGe1qoRqTJGk3XZH+XaLuFPE+/mdSmZsdxqJ0YSI62SfDoq4QdDawt2T44/F0/PiTnLrc3L20aP1zSfz6wdHxbOe1ZOjwvFqce/isHAqHuRtT5LiUX558aG9hFXh7unJUfJu/vXzxcev1zbX1ueXX68vrr5l/3rX7w9UfyG5S07IMflIiuSUnEO4A5DaIp8hnIUF2iNYem3Csmwefg/IETw/Q6HdCcQLUG4VUvbIBTmEu9OyEvkryiTLSuXJMiyVH175jmot3IU4e56Ep3lYYD2HGmARDMvFTbiYDuky3K3jgvyt/N8LKffJwBd9oVQMFH10sNqayKa4olCValSnBlMdoS7qph7qpTXUR/00QIM0RMM0QqM0hqoIqIhAE7SRNtFmmqQpmqYttJVmaJa20XbaQTtpF+2mPbSX9tF+OkAH6RAdpiN0lOboGB2neTpBJ+kUvWMqagjFjPv0AV2gi3SJPkTVDKaO8YQ+ZSoZqIqBihglihdv6TtT6YIpctA9uk8P6Lf0PT2kR/SYntAP9Dt6Ss/oOb2gH+n39BP9TH+gP9Kf6M/0F/prNUWhP68/9rpymf7nv6/0Tz/7UNguGsVP24eFI+d3FydAa7cO3ccXR1vF07ODvWNj5+QQCLPjQ/F0u3h87iocQeyscLzjwcxnB8d7h0XXh8Jp8fiwuHvuxtjpwd7+ubNwdl48PTh7r304vDjTt0+OjgrG/ucP+8VjA+o4ONnRzw4LZ/vaD8XTE/XkuKief3+in++fFova7snFqbZ78LGonh180s+KH4vHepFVqh0fHBehrsOTY9dZ8egAY9ph8exML353UTh07J0WC/Ba+JTi2fnBybFSOL8N3fBsnRa23xfP2Te5tiCKTfWKVPw+T+Fs++Bg++B0++LIfXG8A2DZPjkt6nunhY/F29AaF6u9yN6obhVO3XiHb3Ljm84PDneKrtmdg+IpgP1Mnz0F2Dvvbhd3DgBDxnxh++K8aDzm2VbMbK4NM2YUeI4CNtBT4C3fPSx+chWsPFhcL2Dd22bdRV6yyEsWbSWLsuQBz3PA8xzY8hzIPMdYu3HCs57wrCe2rCcy6wnPesGzXvCsF7asFzLrTmFvr3hq7EDzoOuwXupkPe8QPsFxVtxmvcDYujg8LJ6zfso+/8O+G0oAgwB9/cx9Wtw7YAWKO67tkw+fEeSu89PCTvGocPpexxY4zbcps/PGCnYGF+vWRwfHF2fq5+KxcnThOTnd2YU+ybqoF+JHgLYLaEVRKcDH8g5kdsudk++P3XzUsaixe3gCIK/ZuwB4F49OsN/55B0fT8XDw4MP7INnERrGLAfRCv4oK/PKCaDoeAdeYxSPdvjb+HhmtdWYN/z78A5HLMZ44mfZazbNmHMXuiFrsXP74hSG9vZnbCSOe9lIvMMqlN0DZffQxVECL/Pxkc6QwgAsW7RVOCt64Nn5/skFUpNZC7WeeStuzCL4XfMS2/P84xcx3bNo6xGLMs8iz7PC86zYqlvhTzb4kw3bkw184txhsD87O3Bbj3QO56PC9unJsb51CtTIBdkK2+yrNDZSHGKgePcvjvcKpxdHh4WLc+jfQNTe69sFKGY8Qvwbh/xnjSee4Y86f76vFs/39fX9k9NjoIAQOqDofuFw1104PT35HkGrM1CZGHad7Z5zWuraZZ1kZ+vkk+jkREyeOH8KJSLddsAVmT3rjnaTQdr1e3PE7Pr8XcKlzorQ1M/SIelnlfx//h5JVohXAQA="}}}
},{}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 * @export
 * @enum {number}
 */
var PageOrientation;
(function (PageOrientation) {
    PageOrientation[PageOrientation["Portrait"] = 0] = "Portrait";
    PageOrientation[PageOrientation["Landscape"] = 1] = "Landscape";
})(PageOrientation = exports.PageOrientation || (exports.PageOrientation = {}));
/**
 *
 *
 * @export
 * @class PageSize
 */
class PageSize {
}
exports.PageSize = PageSize;
/**
 *
 *
 * @export
 * @abstract
 * @class PageSizes
 */
class PageSizes {
}
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.X4A0 = {
    width: 4767.87,
    height: 6740.79
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.X2A0 = {
    width: 3370.39,
    height: 4767.87
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A0 = {
    width: 2383.94,
    height: 3370.39
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A1 = {
    width: 1683.78,
    height: 2383.94
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A2 = {
    width: 1190.55,
    height: 1683.78
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A3 = { width: 841.89, height: 1190.55 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A4 = { width: 595.28, height: 841.89 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A5 = { width: 419.53, height: 595.28 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A6 = { width: 297.64, height: 419.53 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A7 = { width: 209.76, height: 297.64 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A8 = { width: 147.4, height: 209.76 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A9 = { width: 104.88, height: 147.4 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.A10 = { width: 73.7, height: 104.88 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B0 = {
    width: 2834.65,
    height: 4008.19
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B1 = {
    width: 2004.09,
    height: 2834.65
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B2 = {
    width: 1417.32,
    height: 2004.09
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B3 = {
    width: 1000.63,
    height: 1417.32
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B4 = { width: 708.66, height: 1000.63 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B5 = { width: 498.9, height: 708.66 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B6 = { width: 354.33, height: 498.9 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B7 = { width: 249.45, height: 354.33 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B8 = { width: 175.75, height: 249.45 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B9 = { width: 124.72, height: 175.75 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.B10 = { width: 87.87, height: 124.72 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C0 = {
    width: 2599.37,
    height: 3676.54
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C1 = {
    width: 1836.85,
    height: 2599.37
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C2 = {
    width: 1298.27,
    height: 1836.85
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C3 = { width: 918.43, height: 1298.27 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C4 = { width: 649.13, height: 918.43 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C5 = { width: 459.21, height: 649.13 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C6 = { width: 323.15, height: 459.21 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C7 = { width: 229.61, height: 323.15 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C8 = { width: 161.57, height: 229.61 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C9 = { width: 113.39, height: 161.57 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.C10 = { width: 79.37, height: 113.39 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.RA0 = {
    width: 2437.8,
    height: 3458.27
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.RA1 = {
    width: 1729.13,
    height: 2437.8
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.RA2 = {
    width: 1218.9,
    height: 1729.13
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.RA3 = { width: 864.57, height: 1218.9 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.RA4 = { width: 609.45, height: 864.57 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.SRA0 = {
    width: 2551.18,
    height: 3628.35
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.SRA1 = {
    width: 1814.17,
    height: 2551.18
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.SRA2 = {
    width: 1275.59,
    height: 1814.17
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.SRA3 = {
    width: 907.09,
    height: 1275.59
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.SRA4 = { width: 637.8, height: 907.09 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.EXECUTIVE = {
    width: 521.86,
    height: 756.0
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.FOLIO = { width: 612.0, height: 936.0 };
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.LEGAL = {
    width: 612.0,
    height: 1008.0
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.LETTER = {
    width: 612.0,
    height: 792.0
};
/**
 *
 *
 * @static
 * @type {PageSize}
 * @memberof PageSizes
 */
PageSizes.TABLOID = {
    width: 792.0,
    height: 1224.0
};
exports.PageSizes = PageSizes;

},{}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfdocument_1 = require("./pdfdocument");
const pagesizes_1 = require("./pagesizes");
const standardfonts_1 = require("./base/standardfonts");
(function () {
    let w = window;
    w.PDFDocument = pdfdocument_1.PDFDocument;
    w.PageSizes = pagesizes_1.PageSizes;
    w.PageSize = pagesizes_1.PageSize;
    w.PageOrientation = pagesizes_1.PageOrientation;
    w.StandardFonts = standardfonts_1.StandardFonts;
})();

},{"./base/standardfonts":36,"./pagesizes":40,"./pdfdocument":42}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const header_1 = require("./structure/header");
const trailer_1 = require("./structure/trailer");
const xref_1 = require("./structure/xref");
const ObjectTypes = require("./base/pdfobjecttypes");
const pagesizes_1 = require("./pagesizes");
const controlcharacters_1 = require("./controlcharacters");
const fontdescriptor_1 = require("./types/fontdescriptor");
const font_1 = require("./types/font");
const fontfile_1 = require("./types/fontfile");
const filespec_1 = require("./types/filespec");
const embeddedfile_1 = require("./types/embeddedfile");
const names_1 = require("./types/names");
const diverda = require("./fonts/diverda.json");
const times = require("./fonts/times-roman.json");
const content_1 = require("./types/content");
const sig_1 = require("./types/sig");
const annot_1 = require("./types/annot");
const acroform_1 = require("./types/acroform");
const xobject_1 = require("./types/xobject");
const palette_1 = require("./types/palette");
/**
 * This is what we want. A PDF Document :3
 *
 * @export
 * @class PDFDocument
 */
class PDFDocument {
    /**
     * Creates an instance of PDFDocument with a prefilled structure and one empty page.
     *
     * @param {PageSize} pagesize
     * @memberof PDFDocument
     */
    constructor(pagesize) {
        this.pagesize = pagesize;
        this.fontFiles = [];
        this.fonts = [];
        this.objects = [];
        this.pages = [];
        this.patches = []; // not yet defined
        /**
         * active page identifier
         *
         * @private
         * @type {number}
         * @memberof PDFDocument
         */
        this._activePage = 1;
        this.fontFiles.push(diverda);
        this.fontFiles.push(times);
        // ToDo: decide if we need a header object since its just 2 lines and a fixed version number
        // ! PDF/A-3 with file attachments becomes PDF/A-4f
        this.header = new header_1.Header(1.7); // ToDo Update to 2.0 as soon as PDF/A-4 hits
        this.trailer = new trailer_1.Trailer();
        // ! initialize first page a bit more elegant please
        this.catalog = new ObjectTypes.Catalog(this.nextObjectId, 0);
        this.objects.push(this.catalog);
        this.names = new names_1.Names(this.nextObjectId, 0, []);
        this.catalog.Attachments.push(this.names);
        this.objects.push(this.names);
        this.pagesDictionary = new ObjectTypes.Pages(this.nextObjectId, 0);
        this.objects.push(this.pagesDictionary);
        let page = new ObjectTypes.Page(this.nextObjectId, 0, pagesize);
        page.Fonts = this.fonts;
        this.pages.push(page);
        this.objects.push(page);
        let meta = new ObjectTypes.MetaData(this.nextObjectId, 0);
        this.objects.push(meta);
        this.catalog.Pages = {
            Id: this.pagesDictionary.Id,
            Generation: this.pagesDictionary.Generation
        };
        this.catalog.MetaData = {
            Id: meta.Id,
            Generation: meta.Generation
        };
        this.pagesDictionary.Kids = [
            {
                Id: page.Id,
                Generation: page.Generation
            }
        ];
        page.Parent = {
            Id: this.pagesDictionary.Id,
            Generation: this.pagesDictionary.Generation
        };
    }
    /**
     * Getter to determine the next available object Id
     *
     *
     * @readonly
     * @type {number}
     * @memberof PDFDocument
     */
    get nextObjectId() {
        var taken = this.objects.find(object => {
            return object.Id === this.objects.length + 1;
        });
        if (!taken) {
            return this.objects.length + 1;
        }
        // ? haven't had this issue yet but it might be possible
        // ? let's find a way to handle it when we encounter this error
        throw 'Object ID already taken. If you encounter this Error, please create an Issue on github with an example PDF';
    }
    /**
     * returns a string with the current file content
     *
     * @returns {string}
     * @memberof PDFDocument
     */
    compile() {
        let file = '';
        this.xref = new xref_1.Xref();
        this.xref.Offsets = [];
        // default xref entry
        this.xref.Offsets.push({
            Position: 0,
            Generation: 65535,
            Free: true
        });
        // #region header
        file +=
            this.header.compile().join(controlcharacters_1.ControlCharacters.EOL) + controlcharacters_1.ControlCharacters.EOL;
        // #endregion
        // #region objects
        this.objects.forEach(object => {
            this.xref.Offsets.push({
                Position: file.length,
                Generation: object.Generation,
                Free: false
            });
            file += object.compile().join(controlcharacters_1.ControlCharacters.EOL);
            file += controlcharacters_1.ControlCharacters.EOL;
            file += controlcharacters_1.ControlCharacters.EOL; // and one extra line after each object to have a nice and readable document
        });
        // #endregion
        // #region xref
        // set xref offset right before we compile the xref table
        this.xref.Offset = file.length;
        file += 'xref' + controlcharacters_1.ControlCharacters.EOL;
        file += 0 + ' ' + this.xref.Offsets.length + controlcharacters_1.ControlCharacters.EOL;
        this.xref.Offsets.sort((obj1, obj2) => {
            if (obj1.Position > obj2.Position) {
                return 1;
            }
            if (obj1.Position < obj2.Position) {
                return -1;
            }
            return 0;
        }).forEach(offset => {
            file +=
                ('0000000000' + offset.Position).slice(-10) +
                    ' ' +
                    ('00000' + offset.Generation).slice(-5) +
                    ' ' +
                    (offset.Free ? 'f' : 'n') +
                    controlcharacters_1.ControlCharacters.EOL;
        });
        // #endregion
        // ToDo: add file patches
        // ToDo: generate actual trailer
        // #region trailer
        file += this.trailer
            .compile(this.xref.Offsets.length, this.xref.Offset)
            .join(controlcharacters_1.ControlCharacters.EOL);
        // #endregion
        // end of file!
        file += controlcharacters_1.ControlCharacters.EOL;
        file += '%%EOF';
        return file;
    }
    /**
     * returns the object type of the document
     *
     * @returns {string}
     * @memberof PDFDocument
     */
    toString() {
        return '[object PDFDocument]';
    }
    /**
     * Append a new and empty page to the PDF.
     *
     * @param {PageSize} pagesize
     * @param {PageOrientation} [pageOrientation=PageOrientation.Portrait]
     * @param {number} [needle]
     * @returns {PDFDocument}
     * @memberof PDFDocument
     */
    addPage(pagesize, pageOrientation = pagesizes_1.PageOrientation.Portrait, needle) {
        let page = new ObjectTypes.Page(this.nextObjectId, 0, pagesize, pageOrientation);
        page.Fonts = this.fonts;
        this.pagesDictionary.Kids.push({
            Id: page.Id,
            Generation: page.Generation
        });
        page.Parent = {
            Id: this.pagesDictionary.Id,
            Generation: this.pagesDictionary.Generation
        };
        this.pages.push(page);
        this.objects.push(page);
        return this;
    }
    /**
     * Adds an Attachment to the PDF
     * (does not upload or load from filesystem!)
     *
     * @param {string} fileName
     * @param {string} fileContent
     * @returns
     * @memberof PDFDocument
     */
    addAttachment(fileName, fileContent) {
        let embeddedfile = new embeddedfile_1.EmbeddedFile(this.nextObjectId, 0, fileName, fileContent);
        this.objects.push(embeddedfile);
        let filespec = new filespec_1.Filespec(this.nextObjectId, 0, fileName, embeddedfile);
        this.objects.push(filespec);
        this.names.NamedReferences.push(filespec);
        return this;
    }
    /**
     * embed a font into the pdf by the postscript name
     *
     * @param {string} fontName
     * @returns
     * @memberof PDFDocument
     */
    addFont(fontName) {
        let fontJSON = this.fontFiles.find((font) => {
            return font.BaseFont === fontName;
        });
        let fontFile = new fontfile_1.FontFile(this.nextObjectId, 0, fontJSON.Subtype, fontJSON.BaseFont, fontJSON.FirstChar, fontJSON.LastChar, fontJSON.FontDescriptor.FontFile2.Length, fontJSON.FontDescriptor.FontFile2.Length1, fontJSON.FontDescriptor.FontFile2.Stream);
        this.objects.push(fontFile);
        let fontDescriptor = new fontdescriptor_1.FontDescriptor(this.nextObjectId, 0, fontJSON.FontDescriptor.FontName, fontJSON.FontDescriptor.FontFamily, fontJSON.FontDescriptor.FontStretch, fontJSON.FontDescriptor.FontWeight, fontJSON.FontDescriptor.Flags, fontJSON.FontDescriptor.FontBBox, fontJSON.FontDescriptor.ItalicAngle, fontJSON.FontDescriptor.Ascent, fontJSON.FontDescriptor.Descent, fontJSON.FontDescriptor.CapHeight, fontJSON.FontDescriptor.XHeight, fontJSON.FontDescriptor.StemV, fontJSON.FontDescriptor.AvgWidth, fontJSON.FontDescriptor.MaxWidth, fontFile);
        this.objects.push(fontDescriptor);
        let font = new font_1.Font(this.nextObjectId, 0, fontFile, fontDescriptor, fontJSON.Widths);
        this.fonts.push(font);
        this.objects.push(font);
        return this;
    }
    /**
     * reference a top 14 font into the pdf by name
     * (does not conform the PDF/A standard since it does not embed the font program)
     *
     * @param {string} fontName
     * @returns
     * @memberof PDFDocument
     */
    addStandardFont(fontName) {
        const font = new font_1.Font(this.nextObjectId, 0, null, null, null, 'Type1', fontName);
        this.fonts.push(font);
        this.objects.push(font);
        return this;
    }
    /**
     * not yet implemented
     *
     * @param {string} fontname
     * @param {number} fontweight
     * @param {number} fontsize
     * @returns {PDFDocument}
     * @memberof PDFDocument
     */
    setDefaultFont(fontname, fontweight, fontsize) {
        return this;
    }
    /**
     * active page setter
     *
     * @param {number} index
     * @memberof PDFDocument
     */
    setActivePage(index) {
        this._activePage = index;
        return this;
    }
    /**
     * active page getter
     *
     * @readonly
     * @type {PdfObjectReference}
     * @memberof PDFDocument
     */
    get ActivePage() {
        return this.pagesDictionary.Kids[this._activePage - 1];
    }
    /**
     * add text to the current active page
     *
     * @param {string[]} text
     * @returns {PDFDocument}
     * @memberof PDFDocument
     */
    text(text) {
        const page = this.pages.find(page => {
            return page.Id === this.ActivePage.Id;
        });
        let content = new content_1.Content(this.nextObjectId, 0);
        content.Stream = text;
        page.Contents.push(content);
        this.objects.push(content);
        return this;
    }
    /**
     * add a signature field to the document
     *
     * @param {string} fieldName
     * @param {Position} position
     * @param {*} [style]
     * @returns {PDFDocument}
     * @memberof PDFDocument
     */
    addSignatureField(imageData) {
        const sig = new sig_1.Sig(this.nextObjectId, 0);
        this.objects.push(sig);
        const annot = new annot_1.Annot(this.nextObjectId, 0, sig, this.pages[0]);
        this.objects.push(annot);
        const acroForm = new acroform_1.AcroForm(this.nextObjectId, 0);
        acroForm.Fields.push(annot);
        this.objects.push(acroForm);
        this.pages[0].Annots.push(annot);
        // so weit funzt es
        const image = new xobject_1.XObject(this.nextObjectId, 0);
        image.Stream = imageData;
        this.objects.push(image);
        const palette = new palette_1.Palette(this.nextObjectId, 0);
        this.objects.push(palette);
        image.Palette = palette;
        const page = this.pages.find(page => {
            return page.Id === this.ActivePage.Id;
        });
        page.XObjects.push(image);
        return this;
    }
    /**
     * fill a signature field
     * (also attached biometric data as a file if provided)
     *
     * @param {string} fieldName
     * @param {ImageBitmap} image
     * @param {*} [biometrics]
     * @returns {PDFDocument}
     * @memberof PDFDocument
     */
    fillSignature(fieldName, image, biometrics) {
        return this;
    }
    sign() {
        return this;
    }
}
exports.PDFDocument = PDFDocument;

},{"./base/pdfobjecttypes":35,"./controlcharacters":37,"./fonts/diverda.json":38,"./fonts/times-roman.json":39,"./pagesizes":40,"./structure/header":43,"./structure/trailer":44,"./structure/xref":46,"./types/acroform":47,"./types/annot":48,"./types/content":50,"./types/embeddedfile":51,"./types/filespec":52,"./types/font":53,"./types/fontdescriptor":54,"./types/fontfile":55,"./types/names":57,"./types/palette":60,"./types/sig":61,"./types/xobject":63}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 * @export
 * @class Header
 */
class Header {
    /**
     * header
     *
     * @param {number} version
     * @memberof Header
     */
    constructor(version) {
        this.version = version;
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Header
     */
    compile() {
        return [`%PDF-${this.version.toFixed(1)}`, '%\xFF\xFF\xFF\xFF', ''];
    }
    /**
     *
     *
     * @returns
     * @memberof Header
     */
    toJson() {
        return {
            type: '...',
            header: `%PDF-${this.version.toFixed(1)}`
        };
    }
}
exports.Header = Header;

},{}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 * @export
 * @class Trailer
 */
class Trailer {
    constructor() {
        /**
         *
         *
         * @type {string}
         * @memberof Trailer
         */
        this.ID = 'd41d8cd98f00b204e9800998ecf8427e'; // ToDo: how do these IDs even work?
    }
    /**
     *
     *
     * @param {number} size
     * @param {number} startXref
     * @returns {string[]}
     * @memberof Trailer
     */
    compile(size, startXref) {
        return [
            'trailer',
            '<<',
            '/ID [',
            `  <${this.ID}>`,
            `  <${this.ID}>`,
            ']',
            '/Root 1 0 R',
            '/Size ' + size,
            '>>',
            'startxref',
            startXref.toString()
        ];
    }
}
exports.Trailer = Trailer;

},{}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 * @export
 * @class XMPMeta
 */
class XMPMeta {
    /**
     *
     *
     * @returns {string[]}
     * @memberof XMPMeta
     */
    compile() {
        return [
            `<x:xmpmeta xmlns:x='adobe:ns:meta/' x:xmptk='Insert XMP tool name here.'>`,
            `  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">`,
            `    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">`,
            `      <pdfaid:part>3</pdfaid:part>`,
            `      <pdfaid:conformance>U</pdfaid:conformance>`,
            `    </rdf:Description>`,
            `  </rdf:RDF>`,
            `</x:xmpmeta>`
        ];
    }
}
exports.XMPMeta = XMPMeta;

},{}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 *
 * @export
 * @class Offset
 */
class Offset {
}
exports.Offset = Offset;
/**
 *
 *
 * @export
 * @class Xref
 */
class Xref {
    constructor() {
        this.Offsets = [];
        this.Offset = 0;
    }
    compile() {
        return [];
    }
}
exports.Xref = Xref;

},{}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const controlcharacters_1 = require("../controlcharacters");
class AcroForm extends pdfobject_1.PdfObject {
    constructor(Id, Generation) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.Fields = [];
        this.Type = null;
    }
    compileSomething() {
        const fieldRefs = this.Fields.map((field, index) => {
            return ` ${field.Id} ${field.Generation} R`;
        });
        return [
            `/Type /AcroForm`,
            `/SigFlags 3`,
            `/Fields [ ${fieldRefs.join(controlcharacters_1.ControlCharacters.sp)} ]`
        ];
    }
    compile() {
        return [
            ...this.startObject(),
            ...this.compileSomething(),
            ...this.endObject()
        ];
    }
}
exports.AcroForm = AcroForm;

},{"../base/pdfobject":33,"../controlcharacters":37}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
const util_1 = require("util");
/**
 *
 *
 * @export
 * @class Annot
 * @extends {PdfObject}
 */
class Annot extends pdfobject_1.PdfObject {
    /**
     *Creates an instance of Annot.
     * @param {number} Id
     * @param {number} Generation
     * @memberof Annot
     */
    constructor(Id, Generation, signature, pageReference) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.signature = signature;
        this.pageReference = pageReference;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Sig;
    }
    /**
     *
     *
     * @returns
     * @memberof Annot
     */
    compileUnprocessed() {
        let utf8Encode = new TextEncoder();
        // ToDo: uhm... ya... you know
        // /Desc removed
        return [
            `/Type /Annot`,
            `/Subtype /Text`,
            `/FT /Sig`,
            `/Rect [0 0 100 100]`,
            `/V ${this.signature.Id} ${this.signature.Generation} R`,
            `/T (Signature9)`,
            /*`/F 4`,*/
            `/P ${this.pageReference.Id} ${this.pageReference.Generation} R`
        ];
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Annot
     */
    compile() {
        return [
            ...this.startObject(),
            ...this.compileUnprocessed(),
            ...this.endObject()
        ];
    }
}
exports.Annot = Annot;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34,"util":32}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
/**
 *
 *
 * @export
 * @class Catalog
 * @extends {PdfObject}
 */
class Catalog extends pdfobject_1.PdfObject {
    /**
     *Creates an instance of Catalog.
     * @param {number} Id
     * @param {number} Generation
     * @param {PdfObjectReference[]} [Kids]
     * @memberof Catalog
     */
    constructor(Id, Generation, Kids) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.Kids = Kids;
        /**
         *
         *
         * @type {PdfObject[]}
         * @memberof Catalog
         */
        this.Attachments = [];
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Catalog;
        /**
         * 	if($this->ZoomMode=='fullpage')
              $this->_put('/OpenAction ['.$n.' 0 R /Fit]');
            elseif($this->ZoomMode=='fullwidth')
              $this->_put('/OpenAction ['.$n.' 0 R /FitH null]');
            elseif($this->ZoomMode=='real')
              $this->_put('/OpenAction ['.$n.' 0 R /XYZ null null 1]');
            elseif(!is_string($this->ZoomMode))
              $this->_put('/OpenAction ['.$n.' 0 R /XYZ null null '.sprintf('%.2F',$this->ZoomMode/100).']');
            if($this->LayoutMode=='single')
              $this->_put('/PageLayout /SinglePage');
            elseif($this->LayoutMode=='continuous')
              $this->_put('/PageLayout /OneColumn');
            elseif($this->LayoutMode=='two')
              $this->_put('/PageLayout /TwoColumnLeft');
         *
         */
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Catalog
     */
    compileAttachments() {
        if (this.Attachments.length) {
            return [
                `/Names << /EmbeddedFiles ${this.Attachments[0].Id} ${this.Attachments[0].Generation} R >>`,
                '/PageMode /UseAttachments'
            ];
        }
        return [];
    }
    /**
     *
     *
     * @returns {string}
     * @memberof Catalog
     */
    compilePageTreeReference() {
        return `/Pages ${this.Pages.Id} ${this.Pages.Generation} R`;
    }
    /**
     *
     *
     * @returns {string}
     * @memberof Catalog
     */
    compileMetaDataReference() {
        return `/Metadata ${this.MetaData.Id} ${this.MetaData.Generation} R`;
    }
    /**
     *
     *
     * @returns {string}
     * @memberof Catalog
     */
    compileAcroForm() {
        if (this.AcroForm) {
            return `/AcroForm ${this.AcroForm.Id} ${this.AcroForm.Generation} R`;
        }
        else {
            return '';
        }
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Catalog
     */
    compile() {
        return [
            ...this.startObject(),
            this.compileType(),
            this.compilePageTreeReference(),
            this.compileMetaDataReference(),
            this.compileAcroForm(),
            ...this.compileAttachments(),
            ...this.endObject()
        ];
    }
}
exports.Catalog = Catalog;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
const util_1 = require("util");
class Content extends pdfobject_1.PdfObject {
    constructor(Id, Generation) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.Stream = [];
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Sig;
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof PdfObject
     */
    startObject() {
        let utf8Encode = new TextEncoder();
        return [
            `${this.Id} ${this.Generation} obj`,
            `<< /Length ${utf8Encode.encode(this.Stream.join('\n')).length} >>`
        ];
    }
    /**
     *
     *
     * @returns
     * @memberof EmbeddedFile
     */
    endObject() {
        return ['stream', ...this.Stream, 'endstream', 'endobj'];
    }
    compile() {
        return [...this.startObject(), ...this.endObject()];
    }
}
exports.Content = Content;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34,"util":32}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
/**
 *
 *
 * @export
 * @class EmbeddedFile
 * @extends {PdfObject}
 */
class EmbeddedFile extends pdfobject_1.PdfObject {
    constructor(Id, Generation, _fileName, _fileContent) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this._fileName = _fileName;
        this._fileContent = _fileContent;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.EmbeddedFile;
    }
    /**
     *
     *
     * @returns
     * @memberof EmbeddedFile
     */
    compileUnprocessed() {
        // ToDo: uhm... ya... you know
        return [
            '/Type /EmbeddedFile',
            `/Length ${this._fileContent.length}`,
            `/Params <</ModDate (D:${'20121110104707'})>>` // ToDo insert actual Date
        ];
    }
    /**
     *
     *
     * @returns
     * @memberof EmbeddedFile
     */
    endObject() {
        return ['>>', 'stream', this._fileContent, 'endstream', 'endobj'];
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof EmbeddedFile
     */
    compile() {
        return [
            ...this.startObject(),
            ...this.compileUnprocessed(),
            ...this.endObject()
        ];
    }
}
exports.EmbeddedFile = EmbeddedFile;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
/**
 *
 *
 * @export
 * @class Filespec
 * @extends {PdfObject}
 */
class Filespec extends pdfobject_1.PdfObject {
    constructor(Id, Generation, _fileName, _embeddedFile) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this._fileName = _fileName;
        this._embeddedFile = _embeddedFile;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Filespec;
    }
    /**
     *
     *
     * @returns
     * @memberof Filespec
     */
    compileUnprocessed() {
        // ToDo: uhm... ya... you know
        // /Desc removed
        return [
            '/Type /Filespec',
            '/AFRelationship /Unspecified',
            `/F (${this._fileName})`,
            `/UF (${this._fileName})`,
            `/EF <</F ${this._embeddedFile.Id} ${this._embeddedFile.Generation} R>>` // ToDo add embedded file reference
        ];
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Filespec
     */
    compile() {
        return [
            ...this.startObject(),
            ...this.compileUnprocessed(),
            ...this.endObject()
        ];
    }
}
exports.Filespec = Filespec;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
/**
 *
 *
 * @export
 * @class Font
 * @extends {PdfObject}
 */
class Font extends pdfobject_1.PdfObject {
    constructor(Id, Generation, _fontFile, _fontDescriptor, _fontWidths, _subType = 'TrueType', _baseFont = 'Helvetica') {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this._fontFile = _fontFile;
        this._fontDescriptor = _fontDescriptor;
        this._fontWidths = _fontWidths;
        this._subType = _subType;
        this._baseFont = _baseFont;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Font;
        this.BaseFont = this._fontDescriptor
            ? this._fontDescriptor.FontName
            : _baseFont;
    }
    /**
     *
     *
     * @returns
     * @memberof Font
     */
    compileUnprocessed() {
        return [
            `/Type /Font`,
            `/Subtype /${this._subType}`,
            `/Encoding /WinAnsiEncoding`,
            `/BaseFont /${this.BaseFont}`,
            this._fontFile ? `/FirstChar ${this._fontFile.FirstChar}` : '',
            this._fontFile ? `/LastChar ${this._fontFile.LastChar}` : '',
            this._fontDescriptor
                ? `/FontDescriptor ${this._fontDescriptor.Id} ${this._fontDescriptor.Generation} R`
                : '',
            this._fontWidths ? `/Widths [${this._fontWidths.join(' ')}]` : ''
        ];
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Font
     */
    compile() {
        return [
            ...this.startObject(),
            ...this.compileUnprocessed(),
            ...this.endObject()
        ];
    }
}
exports.Font = Font;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
/**
 *
 *
 * @export
 * @class FontDescriptor
 * @extends {PdfObject}
 */
class FontDescriptor extends pdfobject_1.PdfObject {
    constructor(Id, Generation, FontName, FontFamily, FontStretch, FontWeight, Flags, FontBBox, ItalicAngle, Ascent, Descent, CapHeight, XHeight, StemV, AvgWidth, MaxWidth, _fontFile) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.FontName = FontName;
        this.FontFamily = FontFamily;
        this.FontStretch = FontStretch;
        this.FontWeight = FontWeight;
        this.Flags = Flags;
        this.FontBBox = FontBBox;
        this.ItalicAngle = ItalicAngle;
        this.Ascent = Ascent;
        this.Descent = Descent;
        this.CapHeight = CapHeight;
        this.XHeight = XHeight;
        this.StemV = StemV;
        this.AvgWidth = AvgWidth;
        this.MaxWidth = MaxWidth;
        this._fontFile = _fontFile;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.FontDescriptor;
    }
    /**
     *
     *
     * @returns
     * @memberof FontDescriptor
     */
    compileUnprocessed() {
        return [
            `/Type /FontDescriptor`,
            `/FontName /${this.FontName}`,
            `/FontFamily (${this.FontFamily})`,
            `/FontStretch /${this.FontStretch}`,
            `/FontWeight ${this.FontWeight}`,
            `/Flags ${this.Flags}`,
            `/FontBBox [${this.FontBBox.join(' ')}]`,
            `/ItalicAngle ${this.ItalicAngle}`,
            `/Ascent ${this.Ascent}`,
            `/Descent ${this.Descent}`,
            `/CapHeight ${this.CapHeight}`,
            `/XHeight ${this.XHeight}`,
            `/StemV ${this.StemV}`,
            `/AvgWidth ${this.AvgWidth}`,
            `/MaxWidth ${this.MaxWidth}`,
            `/FontFile2 ${this._fontFile.Id} ${this._fontFile.Generation} R`
        ];
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof FontDescriptor
     */
    compile() {
        return [
            ...this.startObject(),
            ...this.compileUnprocessed(),
            ...this.endObject()
        ];
    }
}
exports.FontDescriptor = FontDescriptor;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
const fs_1 = require("fs");
/**
 *
 *
 * @export
 * @class FontFile
 * @extends {PdfObject}
 */
class FontFile extends pdfobject_1.PdfObject {
    constructor(Id, Generation, Subtype, BaseFont, FirstChar, LastChar, Length, Length1, Stream) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.Subtype = Subtype;
        this.BaseFont = BaseFont;
        this.FirstChar = FirstChar;
        this.LastChar = LastChar;
        this.Length = Length;
        this.Length1 = Length1;
        this.Stream = Stream;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.FontFile;
    }
    /**
     *
     *
     * @returns
     * @memberof FontFile
     */
    endObject() {
        return [
            '>>',
            'stream',
            fs_1.readFileSync('./src/fonts/diverda.compressed.ttf', 'binary'),
            'endstream',
            'endobj'
        ];
    }
    /**
     *
     *
     * @returns
     * @memberof FontFile
     */
    compileUnprocessed() {
        return [
            `/Length ${this.Length}`,
            `/Length1 ${this.Length1}`,
            `/Filter /FlateDecode`
        ];
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof FontFile
     */
    compile() {
        return [
            ...this.startObject(),
            ...this.compileUnprocessed(),
            ...this.endObject()
        ];
    }
}
exports.FontFile = FontFile;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34,"fs":3}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
const xmpmeta_1 = require("../structure/xmpmeta");
const controlcharacters_1 = require("../controlcharacters");
const util_1 = require("util");
/**
 *
 *
 * @export
 * @class MetaData
 * @extends {PdfObject}
 */
class MetaData extends pdfobject_1.PdfObject {
    /**
     *Creates an instance of MetaData.
     * @param {number} Id
     * @param {number} Generation
     * @param {PdfObjectReference} [Parent]
     * @memberof MetaData
     */
    constructor(Id, Generation, Parent) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.Parent = Parent;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Metadata;
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof MetaData
     */
    compile() {
        let xmpmeta = new xmpmeta_1.XMPMeta();
        let metaxml = xmpmeta.compile().join(controlcharacters_1.ControlCharacters.EOL);
        let utf8Encode = new TextEncoder();
        return [
            `${this.Id} ${this.Generation} obj`,
            `<<`,
            `/Length ${utf8Encode.encode(metaxml).length}`,
            `/Type /${this.Type}`,
            `/Subtype /XML`,
            `>>`,
            `stream`,
            metaxml,
            `endstream`,
            `endobj`
        ];
    }
}
exports.MetaData = MetaData;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34,"../controlcharacters":37,"../structure/xmpmeta":45,"util":32}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
/**
 * An object containing an array of name object references
 *
 * @export
 * @class Names
 * @extends {PdfObject}
 */
class Names extends pdfobject_1.PdfObject {
    constructor(Id, Generation, NamedReferences) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.NamedReferences = NamedReferences;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Filespec;
    }
    /**
     *
     *
     * @returns
     * @memberof Names
     */
    compileUnprocessed() {
        // ToDo: uhm... ya... you know
        return [
            `/Names [ ${this.NamedReferences.map((ref, index) => {
                return `(${('test.txt' + index).slice(-3)}) ${ref.Id} ${ref.Generation} R`;
            }).join(' ')}]`
        ];
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Names
     */
    compile() {
        return [
            ...this.startObject(),
            ...this.compileUnprocessed(),
            ...this.endObject()
        ];
    }
}
exports.Names = Names;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
const pagesizes_1 = require("../pagesizes");
const controlcharacters_1 = require("../controlcharacters");
class Page extends pdfobject_1.PdfObject {
    constructor(Id, Generation, _pagesize, _orientation = pagesizes_1.PageOrientation.Portrait, Parent) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this._pagesize = _pagesize;
        this._orientation = _orientation;
        this.Parent = Parent;
        /**
         * The MediaBox is the visible Page rectangle
         *
         * @memberof Page
         */
        this.MediaBox = [0, 0, 0, 0];
        this.Contents = [];
        this.Fonts = [];
        this.Annots = [];
        this.XObjects = [];
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Page;
        if (_orientation === pagesizes_1.PageOrientation.Portrait) {
            this.MediaBox = [0, 0, _pagesize.width, _pagesize.height];
        }
        else {
            this.MediaBox = [0, 0, _pagesize.height, _pagesize.width];
        }
        /**		$this->_put('/Rotate '.$this->PageInfo[$n]['rotation']);
         */
    }
    /**
     *
     *
     * @returns {string}
     * @memberof Page
     */
    compileMediaBox() {
        return `/MediaBox [${this.MediaBox[0]} ${this.MediaBox[1]} ${this.MediaBox[2]} ${this.MediaBox[3]}]`;
    }
    compileImages() {
        return [
            '  /XObject <<',
            ...this.XObjects.map((obj, index) => {
                return `    /Image${index} ${obj.Id} ${obj.Generation} R`;
            }),
            '  >>'
        ];
    }
    /**
     *
     *
     * @returns {string}
     * @memberof Page
     */
    compileResources() {
        return [
            '/Resources <<',
            '  /ProcSet [/PDF /Text /ImageB /ImageC /ImageI]',
            '  /Font <<',
            ...this.Fonts.map((font, index) => {
                return `    /${font.BaseFont} ${font.Id} ${font.Generation} R`;
            }),
            '  >>',
            ...this.compileImages(),
            '>>'
        ];
    }
    compileContentReferences() {
        return [
            '/Contents [',
            ...this.Contents.map((content, index) => {
                return ` ${content.Id} ${content.Generation} R`;
            }),
            ']'
        ];
    }
    /**
     *
     *
     * @returns {string}
     * @memberof Page
     */
    compileParent() {
        return this.Parent
            ? `/Parent ${this.Parent.Id} ${this.Parent.Generation} R`
            : '';
    }
    /**
     *
     *
     * @returns {string}
     * @memberof Page
     */
    compileAnnotations() {
        const annotations = this.Annots.map((annot, index) => {
            return ` ${annot.Id} ${annot.Generation} R`;
        });
        return this.Annots.length
            ? `/Annots [ ${annotations.join(controlcharacters_1.ControlCharacters.sp)} ]`
            : '';
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Page
     */
    compile() {
        return [
            ...this.startObject(),
            this.compileType(),
            this.compileParent(),
            this.compileMediaBox(),
            ...this.compileContentReferences(),
            ...this.compileResources(),
            this.compileAnnotations(),
            ...this.endObject()
        ];
    }
}
exports.Page = Page;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34,"../controlcharacters":37,"../pagesizes":40}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
/**
 * Pages is a Dictionary in PDF which contains references to all Page Objects
 *
 * @export
 * @class Pages
 * @extends {PdfObject}
 */
class Pages extends pdfobject_1.PdfObject {
    constructor(Id, Generation, Kids) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.Kids = Kids;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Pages;
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Pages
     */
    compileSubPages() {
        if (!this.Kids || this.Kids.length === 0) {
            return [];
        }
        let kids = [];
        this.Kids.forEach(kid => {
            kids.push(`  ${kid.Id} ${kid.Generation} R`);
        });
        return ['/Kids [', ...kids, ']'];
    }
    /**
     *
     *
     * @returns {string}
     * @memberof Pages
     */
    compileCount() {
        if (!this.Kids || this.Kids.length === 0) {
            return '';
        }
        return `/Count ${this.Kids.length}`;
    }
    /**
     *
     *
     * @returns {string[]}
     * @memberof Pages
     */
    compile() {
        return [
            ...this.startObject(),
            this.compileType(),
            ...this.compileSubPages(),
            this.compileCount(),
            ...this.endObject()
        ];
    }
}
exports.Pages = Pages;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
class Palette extends pdfobject_1.PdfObject {
    constructor(Id, Generation) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Sig;
    }
    endObject() {
        // ToDo: just added the file and a demo sig field...
        // /Desc removed
        return [
            `/Length ${this.Stream.length}`,
            '>>',
            'stream',
            this.Stream,
            `endstream`,
            'endobj'
        ];
    }
    compile() {
        return [...this.startObject(), ...this.endObject()];
    }
}
exports.Palette = Palette;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
class Sig extends pdfobject_1.PdfObject {
    constructor(Id, Generation) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Sig;
    }
    compileUnprocessed() {
        // ToDo: just added the file and a demo sig field...
        // /Desc removed
        return [
            '/Type /Sig',
            '/Filter /Adobe.PPKLite',
            '/Subfilter /adbe.pkcs7.detached',
            '/ByteRange [0 /********** /********** /**********]',
            `/Contents <${new Array(8193).join('0')}>`,
            '/Reason (just because)',
            '/M (D:20190611075000Z)'
        ];
    }
    compile() {
        return [
            ...this.startObject(),
            ...this.compileUnprocessed(),
            ...this.endObject()
        ];
    }
}
exports.Sig = Sig;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const util_1 = require("util");
class Image {
    /**
     *
     */
    constructor(_fileContent) {
        this._fileContent = _fileContent;
        this.Palette = '';
        this.Transparency = '';
        this.Data = '';
        this.Length = 0;
        this.SubType = 'Image';
        this._parse();
    }
    Compile() {
        let utf8Encode = new TextEncoder();
        if (this.ColorSpace === 'Indexed') {
        }
        return [
            `/Subtype /${this.SubType}`,
            `/Width ${this.Width}`,
            `/Height ${this.Height}`,
            this.ColorSpace === 'Indexed'
                ? `/ColorSpace [/Indexed /DeviceRGB 39 ${this.PaletteReference.Id} ${this.PaletteReference.Generation} R]`
                : `/ColorSpace /${this.ColorSpace}`,
            this.ColorSpace === 'DeviceCMYK' ? '/Decode [1 0 1 0 1 0 1 0]' : '',
            `/BitsPerComponent ${this.BitsPerComponent}`,
            `/Filter /FlateDecode`,
            `/DecodeParms << /Predictor 15 /Colors ${this.ColorSpace === 'DeviceRGB' ? 3 : 1} /BitsPerComponent ${this.BitsPerComponent} /Columns ${this.Width} >>`,
            `/Length ${this.Length}`,
            `>>`,
            `stream`,
            this.Data,
            `endstream`
        ];
    }
    _parse() {
        const readable = new stream_1.Readable();
        readable._read = () => { }; // _read is required but you can noop it
        readable.push(this._fileContent);
        readable.push(null);
        if (readable.read(8).toString() !==
            String.fromCharCode(65533) + 'PNG' + String.fromCharCode(13, 10, 26, 10)) {
            //throw 'png signature could not be verified';
        }
        // omit header chunk
        readable.read(4);
        // IHDR
        if (readable.read(4).toString() !== 'IHDR') {
            //throw 'png header could not be verified';
        }
        this.Width = readable.read(4).readInt32BE(0);
        this.Height = readable.read(4).readInt32BE(0);
        this.BitsPerComponent = readable.read(1).readInt8(0);
        if (this.BitsPerComponent > 8) {
            //throw '16-bit depth is not supportet';
        }
        this.ColorSpaceType = readable.read(1).readInt8(0);
        this.ColorSpace = '';
        switch (this.ColorSpaceType) {
            case 0:
            case 4:
                // DeviceGray
                this.ColorSpace = 'DeviceGray';
                break;
            case 2:
            case 6:
                // DeviceRGB
                this.ColorSpace = 'DeviceRGB';
                break;
            case 3:
                // Indexed
                this.ColorSpace = 'Indexed';
                break;
            default:
                throw 'Color Type not readable';
        }
        // compression method
        if (readable.read(1).readInt8(0) !== 0) {
            throw 'unknown compression method';
        }
        // filter method
        if (readable.read(1).readInt8(0) !== 0) {
            throw 'unknown filter method';
        }
        // interlacing
        if (readable.read(1).readInt8(0) !== 0) {
            throw 'interlacing not supported';
        }
        // omit
        readable.read(4);
        let next = 0;
        do {
            next = readable.read(4).readInt32BE(0);
            const type = readable.read(4).toString();
            if (type === 'PLTE') {
                this.Palette = readable.read(next).toString('binary');
                console.log(this.Palette);
                readable.read(4);
            }
            else if (type === 'tRNS') {
                this.Transparency = readable.read(next);
                // ToDo implement transparency
                if (this.ColorSpaceType === 0) {
                    //$trns = array(ord(substr($t, 1, 1)));
                }
                else if (this.ColorSpaceType === 2) {
                    // $trns = array(ord(substr($t,1,1)), ord(substr($t,3,1)), ord(substr($t,5,1)));
                }
                else {
                    // $pos = strpos($t,chr(0));
                    // if($pos!==false)
                    //    $trns = array($pos);
                }
                readable.read(4);
            }
            else if (type === 'IDAT') {
                this.Length = next;
                this.Data += readable.read(next).toString('binary');
                readable.read(4);
            }
            else if (type === 'IEND') {
                break;
            }
            else {
                readable.read(next + 4);
            }
        } while (next);
    }
}
exports.Image = Image;

},{"stream":27,"util":32}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pdfobject_1 = require("../base/pdfobject");
const pdfobjecttype_enum_1 = require("../base/pdfobjecttype.enum");
const image_1 = require("./subtypes/image");
class XObject extends pdfobject_1.PdfObject {
    constructor(Id, Generation) {
        super();
        this.Id = Id;
        this.Generation = Generation;
        this.Type = pdfobjecttype_enum_1.PdfObjectType.Sig;
    }
    compileUnprocessed() {
        const image = new image_1.Image(this.Stream);
        this.Palette.Stream = image.Palette;
        image.PaletteReference = {
            Id: this.Palette.Id,
            Generation: this.Palette.Generation
        };
        return ['/Type /XObject', ...image.Compile()];
    }
    endObject() {
        return ['endobj'];
    }
    compile() {
        return [
            ...this.startObject(),
            ...this.compileUnprocessed(),
            ...this.endObject()
        ];
    }
}
exports.XObject = XObject;

},{"../base/pdfobject":33,"../base/pdfobjecttype.enum":34,"./subtypes/image":62}]},{},[41]);
