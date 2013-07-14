// #ifdef UNDEFINED
/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
// #endif
/**
 * @alias PSON.T
 */
PSON.T = (function() {

    /**
     * PSON byte types.
     * @exports PSON.T
     * @namespace
     */
    var T = {};
    
    T.ZERO       = 0x00; // 0
    //             0x01; // -1
    //             0x02; // 1
    //             ...   // zig-zag encoded varints
    T.MAX        = 0xEF; // -120, max. zig-tag encoded varint
    
    T.NULL       = 0xF0; // null
    T.TRUE       = 0xF1; // true
    T.FALSE      = 0xF2; // false
    T.EOBJECT    = 0xF3; // {}
    T.EARRAY     = 0xF4; // []
    T.ESTRING    = 0xF5; // ""
    T.OBJECT     = 0xF6; // {...}
    T.ARRAY      = 0xF7; // [...]
    T.INTEGER    = 0xF8; // number (zig-zag encoded varint32)
    T.LONG       = 0xF9; // Long   (zig-zag encoded varint64)
    T.FLOAT      = 0xFA; // number (float32)
    T.DOUBLE     = 0xFB; // number (float64)
    T.STRING     = 0xFC; // string (varint length + data)
    T.STRING_ADD = 0xFD; // string (varint length + data + add to dictionary)
    T.STRING_GET = 0xFE; // string (varint index to get from dictionary)
    T.BINARY     = 0xFF; // ArrayBuffer (varint length + bytes)
    
    return T;
    
})();
