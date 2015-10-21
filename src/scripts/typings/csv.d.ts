// Type definitions for CSV-JS
// Project: https://github.com/gkindel/CSV-JS
// Definitions by: Treer <https://github.com/Treer/>

interface iCsvJS {

    RELAXED:                 boolean
    IGNORE_RECORD_LENGTH:    boolean
    IGNORE_QUOTES:           boolean
    LINE_FEED_OK:            boolean
    CARRIAGE_RETURN_OK:      boolean
    DETECT_TYPES:            boolean
    IGNORE_QUOTE_WHITESPACE: boolean
    DEBUG:                   boolean
    TRIM_UNQUOTED_VALUES:    boolean
    EXPAND_QUOTED_NEWLINES:  boolean

    /**
     * @name CSV.parse
     * @function
     * @description rfc4180 standard csv parse
     * with options for strictness and data type conversion
     * By default, will automatically type-cast numeric an boolean values.
     * @param {String} str A CSV string
     * @return {Array} An array records, each of which is an array of scalar values.
     * @example
     * // simple
     * var rows = CSV.parse("one,two,three\nfour,five,six")
     * // rows equals [["one","two","three"],["four","five","six"]]
     * @example
     * // Though not a jQuery plugin, it is recommended to use with the $.ajax pipe() method:
     * $.get("csv.txt")
     *    .pipe( CSV.parse )
     *    .done( function(rows) {
     *        for( var i =0; i < rows.length; i++){
     *            console.log(rows[i])
     *        }
     *  });
     * @see http://www.ietf.org/rfc/rfc4180.txt
     */	
	parse(str: string): any[];
}

declare var CSV: iCsvJS;