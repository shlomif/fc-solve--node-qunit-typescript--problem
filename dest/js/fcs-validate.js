define("fcs-validate", ["require", "exports"], function (require, exports) {
    "use strict";
    // Adapted from http://www.inventpartners.com/javascript_is_int - thanks.
    function is_int(input) {
        var value = "" + input;
        if ((parseFloat(value) == parseInt(value)) && !isNaN(input)) {
            return true;
        }
        else {
            return false;
        }
    }
    var _ranks__int_to_str = "0A23456789TJQK";
    var _ranks__str_to_int = {};
    function _perl_range(start, end) {
        var ret = [];
        for (var i = start; i <= end; i++) {
            ret.push(i);
        }
        return ret;
    }
    _perl_range(1, 13).forEach(function (rank) {
        _ranks__str_to_int[_ranks__int_to_str.substring(rank, rank + 1)] = rank;
    });
    var _suits__int_to_str = "HCDS";
    var _suits__str_to_int = {};
    _perl_range(0, 3).forEach(function (suit) {
        _suits__str_to_int[_suits__int_to_str.substring(suit, suit + 1)] = suit;
    });
    var Card = (function () {
        function Card(rank, suit) {
            if (!is_int(rank)) {
                throw "rank is not an integer.";
            }
            if (!is_int(suit)) {
                throw "suit is not an integer.";
            }
            if (rank < 1) {
                throw "rank is too low.";
            }
            if (rank > 13) {
                throw "rank is too high.";
            }
            if (suit < 0) {
                throw "suit is negative.";
            }
            if (suit > 3) {
                throw "suit is too high.";
            }
            this.rank = rank;
            this.suit = suit;
        }
        Card.prototype.getRank = function () {
            return this.rank;
        };
        Card.prototype.getSuit = function () {
            return this.suit;
        };
        Card.prototype.toString = function () {
            return _ranks__int_to_str.substring(this.rank, this.rank + 1) + _suits__int_to_str.substring(this.suit, this.suit + 1);
        };
        return Card;
    }());
    var Column = (function () {
        function Column(cards) {
            this.cards = cards;
        }
        Column.prototype.getLen = function () {
            return this.cards.length;
        };
        Column.prototype.getCard = function (idx) {
            var that = this;
            if (idx < 0) {
                throw "idx is below zero.";
            }
            if (idx >= that.getLen()) {
                throw "idx exceeds the length of the column.";
            }
            return that.cards[idx];
        };
        Column.prototype.getArrOfStrs = function () {
            var that = this;
            return _perl_range(0, that.getLen() - 1).map(function (i) {
                return that.getCard(i).toString();
            });
        };
        return Column;
    }());
    var card_re = '([A23456789TJQK])([HCDS])';
    function fcs_js__card_from_string(s) {
        var m = s.match('^' + card_re + '$');
        if (!m) {
            throw "Invalid format for a card - \"" + s + "\"";
        }
        return new Card(_ranks__str_to_int[m[1]], _suits__str_to_int[m[2]]);
    }
    exports.fcs_js__card_from_string = fcs_js__card_from_string;
    var ColumnParseResult = (function () {
        function ColumnParseResult(is_correct, start_char_idx, num_consumed_chars, error, cards) {
            this.is_correct = is_correct;
            this.num_consumed_chars = num_consumed_chars;
            this.error = error;
            this.col = new Column(cards);
            this.start_char_idx = start_char_idx;
        }
        ColumnParseResult.prototype.getEnd = function () {
            return (this.start_char_idx + this.num_consumed_chars);
        };
        return ColumnParseResult;
    }());
    function fcs_js__column_from_string(start_char_idx, s) {
        var cards = [];
        var is_start = true;
        var consumed = 0;
        function consume_match(m) {
            var len_match = m[1].length;
            consumed += len_match;
            s = s.substring(len_match);
            return;
        }
        consume_match(s.match('^((?:\: +)?)'));
        while (s.length > 0) {
            var m = s.match(/^(\s*(?:#[^\n]*)?\n?)$/);
            if (m) {
                consume_match(m);
                break;
            }
            m = s.match('^(' + (is_start ? '' : ' +') + '(' + card_re + ')' + ')');
            if (!m) {
                m = s.match('^( *)');
                consume_match(m);
                return new ColumnParseResult(false, start_char_idx, consumed, 'Wrong card format - should be [Rank][Suit]', []);
            }
            consume_match(m);
            cards.push(fcs_js__card_from_string(m[2]));
            is_start = false;
        }
        return new ColumnParseResult(true, start_char_idx, consumed, '', cards);
    }
    exports.fcs_js__column_from_string = fcs_js__column_from_string;
    var Freecells = (function () {
        function Freecells(num_freecells, cards) {
            if (!is_int(num_freecells)) {
                throw "num_freecells is not an integer.";
            }
            this.num_freecells = num_freecells;
            if (cards.length != num_freecells) {
                throw "cards length mismatch.";
            }
            this.cards = cards;
        }
        Freecells.prototype.getNum = function () {
            return this.num_freecells;
        };
        Freecells.prototype.getCard = function (idx) {
            var that = this;
            if (idx < 0) {
                throw "idx is below zero.";
            }
            if (idx >= that.getNum()) {
                throw "idx exceeds the length of the column.";
            }
            return that.cards[idx];
        };
        Freecells.prototype.getArrOfStrs = function () {
            var that = this;
            return _perl_range(0, that.getNum() - 1).map(function (i) {
                var card = that.getCard(i);
                return ((card !== null) ? card.toString() : '-');
            });
        };
        return Freecells;
    }());
    // TODO : Merge common functionality with ColumnParseResult into a base class.
    var FreecellsParseResult = (function () {
        function FreecellsParseResult(is_correct, start_char_idx, num_consumed_chars, error, num_freecells, fc) {
            this.is_correct = is_correct;
            this.num_consumed_chars = num_consumed_chars;
            this.error = error;
            this.freecells = new Freecells(num_freecells, fc);
            this.start_char_idx = start_char_idx;
        }
        FreecellsParseResult.prototype.getEnd = function () {
            return (this.start_char_idx + this.num_consumed_chars);
        };
        return FreecellsParseResult;
    }());
    function fcs_js__freecells_from_string(num_freecells, start_char_idx, s) {
        var cards = [];
        var is_start = true;
        var consumed = 0;
        function consume_match(m) {
            var len_match = m[1].length;
            consumed += len_match;
            s = s.substring(len_match);
            return;
        }
        {
            var m = s.match(/^((?:Freecells\: +)?)/);
            if (!m) {
                return new FreecellsParseResult(false, start_char_idx, consumed, 'Wrong ling prefix for freecells - should be "Freecells:"', num_freecells, []);
            }
            consume_match(m);
        }
        while (s.length > 0) {
            var m = s.match(/^(\s*(?:#[^\n]*)?\n?)$/);
            if (m) {
                consume_match(m);
                break;
            }
            m = s.match('^(' + (is_start ? '' : ' +') + "(\\-|(?:" + card_re + '))' + ')');
            if (!m) {
                m = s.match('^( *)');
                consume_match(m);
                return new FreecellsParseResult(false, start_char_idx, consumed, 'Wrong card format - should be [Rank][Suit]', num_freecells, []);
            }
            consume_match(m);
            var card_str = m[2];
            cards.push((card_str == '-') ? null : fcs_js__card_from_string(m[2]));
            is_start = false;
        }
        while (cards.length < num_freecells) {
            cards.push(null);
        }
        if (cards.length != num_freecells) {
            return new FreecellsParseResult(false, start_char_idx, consumed, 'Too many cards specified in Freecells line.', num_freecells, []);
        }
        return new FreecellsParseResult(true, start_char_idx, consumed, '', num_freecells, cards);
    }
    exports.fcs_js__freecells_from_string = fcs_js__freecells_from_string;
});
