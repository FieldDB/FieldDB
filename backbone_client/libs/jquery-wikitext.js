/*
 * Kajabity Wiki Text Plugin for jQuery http://www.kajabity.com/jquery-wikitext/
 * 
 * Copyright (c) 2011 Williams Technologies Limited
 * 
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 * 
 * Kajabity is a trademark of Williams Technologies Limited.
 * http://www.williams-technologies.co.uk
 */
/**
 * @fileOverview Kajabity Wiki Text Plugin for jQuery
 * @author Simon J. Williams
 * @version: 0.3
 */
(function( jQuery )
{
	/**
	 * jQuery definition to anchor JsDoc comments.
	 *  
	 * @see http://jquery.com/
	 * @name jQuery
	 * @class jQuery Library
	 */

	/**
	 * jQuery Utility Function to convert Wiki formatted text to HTML.
	 * 
	 * @namespace Kajabity Wiki Text
	 * @function
	 * @param {string} text the Wiki text to be converted to HTML.
	 * @return {string} HTML formatted text.
	 * @memberOf jQuery
	 */
	jQuery.wikiText = function( text )
	{
		// The source text with nulls/undefined taken care of.
		var source = (text || '').toString();
		// The resultant HTML string - initially empty.
		var html = '';

		// A regular expression to read the source one line at a time.
		var regex = /([^\r\n]*)(\r\n?|\n)/g;
		var lineMatches;
		var offset = 0;
		var line;

		// Regular expressions to match each kind of line level format mark-up.
		var re_blank = /^([ \t]*)$/;
		var re_heading = /^(={1,6})[ \t]+([^=]+)(={1,6})[ \t]*$/;
		var re_bullet = /^[ \t]+\*[ \t]+(.+)$/;
		var re_numbered = /^[ \t]+#[ \t]+(.+)$/;
		var re_mono_start = /^\{{3}$/;
		var re_mono_end = /^\}{3}$/;
		var re_blockquote = /^[ \t]+(.+)$/;
		var re_hr = /^-{4,}$/;
		var matches;

		// Flags indicating which kind of block we are currently in.
		var paragraph = false;
		var olist = false;
		var ulist = false;
		var bq = false;
		var mono = false;

		// Regular expression to find mark-up tokens in each line.
		var regexToken = /(((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?[_.\w-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})|(!+\[)|(!*((_{2})|(\{{3})|(\}{3})|(~{2})|(\^)|(,{2})|('{2,5}))|(\[{1,2}[^\]]+\]{1,2}))/g;

		// Individual mark-up regular expressions - also see the public ones
		// near the bottom of the file.
		var re_named_link = /^\[((((ftp|https?):\/\/)?[\-\w@:%_\+.~#?,&\/\/=]+)|((mailto:)?([_.\w\-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})))([ \t]*([^\]]*))?\]$/;
		var tn_monospace = "{{{";
		var tn_monospace_end = "}}}";
		var tn_bolditalic = "'''''";
		var tn_bold = "'''";
		var tn_italic = "''";
		var tn_superscript = "^";
		var tn_subscript = ",,";
		var tn_underline = "__";
		var tn_strikethrough = "~~";
		var tn_break = "[[BR]]";
		var monospace = false;

		// Keep track of inline format nesting.
		var tagStack = [];
		var poppedStack = [];

		// Inline formatting start tags.
		var beginings =
		{
			bold : "<strong>",
			italic : "<em>",
			monospace : "<tt>",
			underline : "<u>",
			strikethrough : "<strike>",
			superscript : "<sup>",
			subscript : "<sub>"
		};

		// ...and end tags.
		var endings =
		{
			bold : "</strong>",
			italic : "</em>",
			monospace : "</tt>",
			underline : "</u>",
			strikethrough : "</strike>",
			superscript : "</sup>",
			subscript : "</sub>"
		};

		/**
		 * Remove inline formatting at end of a block. Puts it on the
		 * poppedStack to add at the start of the next block.
		 * 
		 * @return {string} end tags for any current inline formatting.
		 */
		var endFormatting = function()
		{
			var tags = '';
			var popped;
			while( tagStack.length > 0 )
			{
				popped = tagStack.pop();
				tags += endings[popped];
				poppedStack.push( popped );
			}
			return tags;
		};

		/**
		 * End the current block and, temporarily, any nested inline formatting,
		 * if any.
		 * 
		 * @return {string} the block (and inline formatting) HTML end tags.
		 */
		var endBlock = function()
		{
			html += endFormatting();

			if( paragraph )
			{
				html += "</p>\n";
				paragraph = false;
			}
			if( olist )
			{
				html += "</li>\n</ol>\n";
				olist = false;
			}
			if( ulist )
			{
				html += "</li>\n</ul>\n";
				ulist = false;
			}
			if( bq )
			{
				html += "</blockquote>\n";
				bq = false;
			}
		};

		/**
		 * Re-add nested formatting removed at the end of the previous block.
		 * 
		 * @return {string} HTML start tags for all continued formatting.
		 */
		var restartFormatting = function()
		{
			var tags = '';
			while( poppedStack.length > 0 )
			{
				var popped = poppedStack.pop();
				tags += beginings[popped];
				tagStack.push( popped );
			}
			return tags;
		};

		/**
		 * As most inline format tags are the same at the start or end, this
		 * toggles the formatting on or off depending if it is currently in the
		 * tagStack.
		 * 
		 * @param {string} label the name of the format to toggle.
		 * @return {string} any HTML start or end tags to toggle the formatting
		 *         with proper nesting.
		 */
		var toggleFormatting = function( label )
		{
			var tags = '';
			if( jQuery.inArray( label, tagStack ) > -1 )
			{
				var popped;
				do
				{
					popped = tagStack.pop();
					tags += endings[popped];
					if( popped === label )
					{
						break;
					}
					poppedStack.push( popped );
				} while( popped !== label );

				tags += restartFormatting();
			}
			else
			{
				tagStack.push( label );
				tags = beginings[label];
			}

			return tags;
		};

		/**
		 * Apply inline formatting to text in a line - and escape any HTML
		 * mark-up tags.
		 * 
		 * @param {string} text the plain text to be formatted and escaped.
		 * @return {string} HTML formatted text.
		 */
		var formatText = function( text )
		{
			var sourceToken = (text || '').toString();
			var formattedText = '';
			var token;
			var offset = 0;
			var tokenArray;
			var linkText;
			var nl_tokenArray;

			// Iterate through any mark-up tokens in the line.
			while( (tokenArray = regexToken.exec( sourceToken )) !== null )
			{
				token = tokenArray[0];
				if( offset < tokenArray.index )
				{
					// Add non-mark-up text.
					formattedText += jQuery.wikiText.safeText( sourceToken
							.substring( offset, tokenArray.index ) );
				}

				if( monospace )
				{
					// Ignore mark-up until end of monospace.
					if( tn_monospace_end === token )
					{
						monospace = false;
						formattedText += toggleFormatting( "monospace" );
					}
					else
					{
						formattedText += jQuery.wikiText.safeText( token );
					}
				}
				else if( tn_monospace === token )
				{
					monospace = true;
					formattedText += toggleFormatting( "monospace" );
				}
				else if( jQuery.wikiText.re_link.test( token ) )
				{
					formattedText += jQuery.wikiText.namedLink( token );
				}
				else if( jQuery.wikiText.re_mail.test( token ) )
				{
					formattedText += jQuery.wikiText.namedLink( token );
				}
				else if( tn_bold === token )
				{
					formattedText += toggleFormatting( "bold" );
				}
				else if( tn_italic === token )
				{
					formattedText += toggleFormatting( "italic" );
				}
				else if( tn_bolditalic === token )
				{
					// Avoid empty tag if nesting is wrong way around.
					if( jQuery.inArray( "bold", tagStack ) > jQuery.inArray(
							"italic", tagStack ) )
					{
						formattedText += toggleFormatting( "bold" );
						formattedText += toggleFormatting( "italic" );
					}
					else
					{
						formattedText += toggleFormatting( "italic" );
						formattedText += toggleFormatting( "bold" );
					}
				}
				else if( tn_superscript === token )
				{
					formattedText += toggleFormatting( "superscript" );
				}
				else if( tn_subscript === token )
				{
					formattedText += toggleFormatting( "subscript" );
				}
				else if( tn_underline === token )
				{
					formattedText += toggleFormatting( "underline" );
				}
				else if( tn_strikethrough === token )
				{
					formattedText += toggleFormatting( "strikethrough" );
				}
				else if( tn_break === token )
				{
					formattedText += "<br/>";
				}
				else if( (nl_tokenArray = re_named_link.exec( token )) !== null )
				{
					formattedText += jQuery.wikiText.namedLink(
							nl_tokenArray[1], nl_tokenArray[10] );
				}
				else if( token[0] === "!" )
				{
					formattedText += jQuery.wikiText.safeText( token
							.substring( 1 ) );
				}
				else
				{
					formattedText += jQuery.wikiText.safeText( token );
				}

				offset = regexToken.lastIndex;
			}

			if( offset < sourceToken.length )
			{
				// Add trailing non-mark-up text.
				formattedText += jQuery.wikiText.safeText( sourceToken
						.substring( offset ) );
			}

			return formattedText;
		};

		/**
		 * Get a single line from the input. This resolves the issue where the
		 * last line is not returned because it doesn't end with CR/LF.
		 * 
		 * @return {string} a single line of input - or null at end of string.
		 */
		var getLine = function()
		{
			if( offset < source.length )
			{
				lineMatches = regex.exec( source );
				if( lineMatches != null )
				{
					offset = regex.lastIndex;
					line = lineMatches[1];
				}
				else
				{
					line = source.substring( offset );
					offset = source.length;
				}
			}
			else
			{
				line = null;
			}

			return line;
		};

		// --------------------------------------------------------------------

		while( getLine() != null )
		{
			if( mono )
			{
				if( line.match( re_mono_end ) )
				{
					mono = false;
					html += "</pre>\n";
				}
				else
				{
					html += jQuery.wikiText.safeText( line ) + "\n";
				}
			}
			else if( line.length === 0 || re_blank.test( line ) )
			{
				endBlock();
			}
			else if( (matches = line.match( re_heading )) !== null )
			{
				endBlock();
				var headingLevel = matches[1].length;
				html += "\n<h" + headingLevel + ">" + restartFormatting()
						+ formatText( matches[2] ) + endFormatting() + "</h"
						+ headingLevel + ">\n\n";
			}
			else if( (matches = line.match( re_bullet )) !== null )
			{
				if( ulist )
				{
					html += endFormatting() + "</li>\n";
				}
				else
				{
					endBlock();
					html += "<ul>\n";
					ulist = true;
				}

				html += "<li>" + restartFormatting() + formatText( matches[1] );
			}
			else if( (matches = line.match( re_numbered )) !== null )
			{
				if( olist )
				{
					html += endFormatting() + "</li>\n";
				}
				else
				{
					endBlock();
					html += "<ol>\n";
					olist = true;
				}

				html += "<li>" + restartFormatting() + formatText( matches[1] );
			}
			else if( line.match( re_mono_start ) )
			{
				endBlock();
				html += "<pre>\n";
				mono = true;
			}
			else if( line.match( re_hr ) )
			{
				endBlock();
				html += "<hr/>\n";
			}
			else if( (matches = line.match( re_blockquote )) )
			{
				// If not already in blockquote - or a list...
				if( !(bq || olist || ulist) )
				{
					endBlock();
					html += "<blockquote>\n";
					html += restartFormatting();
					bq = true;
				}

				html += "\n" + formatText( matches[1] );
			}
			else
			{
				if( !paragraph )
				{
					endBlock();
					html += "<p>\n";
					html += restartFormatting();
					paragraph = true;
				}

				html += formatText( line ) + "\n";
			}
		}

		endBlock();

		return html;
	};

	/**
	 * Escape HTML special characters.
	 * 
	 * @param {string} text which may contain HTML mark-up characters.
	 * @return {string} text with HTML mark-up characters escaped.
	 * @memberOf jQuery.wikiText
	 */
	jQuery.wikiText.safeText = function( text )
	{
		return (text || '').replace( /&/g, "&amp;" ).replace( /</g, "&lt;" )
				.replace( />/g, "&gt;" );
	};

	/**
	 * A regular expression which detects HTTP(S) and FTP URLs.
	 * @type RegExp
	 */
	jQuery.wikiText.re_link = /^((ftp|https?):\/\/)[\-\w@:%_\+.~#?,&\/\/=]+$/;

	/**
	 * A regular expression to match an email address with or without "mailto:"
	 * in front.
	 * @type RegExp
	 */
	jQuery.wikiText.re_mail = /^(mailto:)?([_.\w\-]+@([\w][\w\-]+\.)+[a-zA-Z]{2,3})$/;

	/**
	 * Create a HTML link from a URL and Display Text - default the display to
	 * the URL (tidied up).
	 * <p>
	 * If the URL is missing, the text is returned, if the Name is missing the
	 * URL is tidied up (remove 'mailto:' and un-escape characters) and used as
	 * the name.
	 * </p>
	 * <p>
	 * The name is then escaped using safeText.
	 * </p>
	 * 
	 * @param {string} url the URL which may be a full HTTP(S), FTP or Email URL
	 *            or a relative URL.
	 * @param {string} name
	 * @return {string} text containing a HTML link tag.
	 * @memberOf jQuery.wikiText
	 */
	jQuery.wikiText.namedLink = function( url, name )
	{
		var linkUrl;
		var linkText;

		if( !url ) { return jQuery.wikiText.safeText( name ); }

		if( jQuery.wikiText.re_mail.test( url ) )
		{
			url = url.replace( /mailto:/, "" );
			linkUrl = encodeURI( "mailto:" + url );
		}
		else
		{
			linkUrl = url;
		}

		if( !name )
		{
			name = decodeURI( url );
		}

		linkText = jQuery.wikiText.safeText( name );
		return linkText.link( linkUrl );
	};

	/**
	 * jQuery 'fn' definition to anchor JsDoc comments.
	 *  
	 * 
	 * @see http://jquery.com/
	 * @name fn
	 * @class jQuery Library
	 * @memberOf jQuery
	 */

	/**
	 * A jQuery Wrapper Function to append Wiki formatted text to a DOM object
	 * converted to HTML.
	 * 
	 * @class Wiki Text Wrapper
	 * @param {string} text text with Wiki mark-up.
	 * @return {jQuery} chainable jQuery class
	 * @memberOf jQuery.fn
	 */
	jQuery.fn.wikiText = function( text )
	{
		return this.html( jQuery.wikiText( text ) );
	};
})( jQuery );
