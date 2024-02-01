// ENDPOINT --->
			var endpoint = "http://www.stands4.com/services/v2/quotes.php?";

			// api user id
			var user_id = "4324";

			// api token
			var user_token = "pItViG2NLqsQw782";

			// query searched for by the user
			var query_text = "";

			// key value pairs to send to the stands4 quotes api
			var query_data = {
				"uid": user_id,
				"tokenid": user_token,
				"searchtype":"RANDOM",
				"query":""
			};

			// response xml from the server
			var response_xml = "";

			// the resulting array of our request
			var quotes = [];

			// the author of the quote(s)
			var author = "";

			// the number of quotes to display
			var display_range = {
				min: 0,
				max: 10
			};

			// a reference to the query form
			var form = document.getElementById("query_form");


			// attaches the data held in the query variable and constructs a query url
			function construct_query_url(query_text, searchtype) {

				if ( searchtype != null ) {
					
					query_data.searchtype = searchtype;
	
					// used to collect the get variables and values as one string
					var get_variables_values = [];

					// the finished query
					var query_url = "";

					// set the data query to the text inputted by the user
					query_data.query = query_text;

					// for each property in the query object add it to the get array
					for ( var data in query_data ) {
						get_variables_values.push(
							data + "=" + encodeURI(query_data[data])
							);
					} 

					return query_url = endpoint + get_variables_values.join("&");

				}

				return false;
			}

			// finds the checked radio button
			function find_type() {

				// the chosen search type
				var checked = "";

				radio_container = document.getElementById("search_type_radios");

				radios = radio_container.querySelectorAll("input[type='radio']");

				console.log(radios.length);

				for ( var i = 0; i < radios.length; i++ ) {

					if ( radios[i].checked ) {
						checked = radios[i].getAttribute("value");
					}
				}

				return checked;

			}

			// make a request to STAND4S quotes api
			function make_api_request(query_url) {
				// check query url's length
				if ( ! query_url )
				{
					console.log("There appears to be a problem with that query");
				} else {

					var xhr = new XMLHttpRequest();

					// make a get request to the desired query url
					xhr.open("GET", query_url, true);

					// when the ready state change event fires check status and state
					xhr.onreadystatechange = function() {
						if ( xhr.readyState === 4 ) {
							if ( xhr.status >= 200 && xhr.status < 300 || xhr.status === 304 ) {

								// if the request was a successful one grab the xml response
								response_xml = xhr.responseXML;

								// and extract the quotes
								quotes = extract_quotes(response_xml);

								if ( quotes )
									display(quotes);
								else
									display();
								
								return true;

							} else {
								return false;
							}
						}
					}

					xhr.send(null);
				}	
			}


			// get the quotes from the passed xml object
			function extract_quotes(response_xml) {

				// the quotes xml object
				var quotes_xml = "";

				// an array of quotes
				var quotes = [];
				
				if ( ! (response_xml === null) )
				{
					// retrieve all the quote xml objects
					quotes_xml = response_xml.getElementsByTagName("quote");
					console.log(quotes_xml.length );

					if ( ! (quotes_xml.length === 0 ) )
					{
						author = extract_author(quotes_xml);

						// add them to our quotes array
						for ( var i = 0; i < quotes_xml.length; i++ ) {
							quote = quotes_xml[i].childNodes[0].nodeValue

							// replace any <br> tags with new lines
							quote = quote.replace(/<br>/g, "\n");
							quotes.push(quote);
						}	

					} else {
						return false;
					}
					
				} else {
					return false;
				}

				return quotes;
			}

			function extract_author(quotes_xml) {
				var author = response_xml.getElementsByTagName("author")[0].childNodes[0].nodeValue;

				return author;
			}

			// takes an array of quotes and displays them
			function display(quotes) {

					display_heading();

						// if our quotes ul is already present - make a reference to that
						if ( document.getElementById("quotes") )
							var ul = document.getElementById("quotes");
						else {
							// otherwise create the ul to hold the list of quotes
							var ul = document.createElement("ul");
							ul.setAttribute("id", "quotes");
						}

						// empty the ul 
						empty_list(ul);

					
					if ( quotes )
					{
						// append it to the body
						document.getElementsByTagName("main")[0].appendChild(ul);

						// display the quotes
						display_quotes(ul, quotes, display_range);
					} else {
						display_heading("Can't find quotes for " + query_data.query);
					}
			}

			// displays the heading for the person that was searched for
			function display_heading(passedHeading) {
				if ( document.getElementById("heading") )
					var heading = document.getElementById("heading");
				else {
					// create the ul to hold the list of quotes
					var heading = document.createElement("h1");
					heading.setAttribute("id", "heading");
				}

				// append it to the body
				document.getElementById("heading_column").appendChild(heading);

				if ( passedHeading )
					heading.textContent = passedHeading;
				else if ( query_data.searchtype.toLowerCase() === "search" )
					heading.textContent = query_text;
				else
					heading.textContent = author;
			}

			// retrieves a random quote and displays it
			function randomQuote() {
				query_url = construct_query_url(query_text, "RANDOM");

				make_api_request(query_url);
			}

			// displays the quotes on the page
			function display_quotes(ul, quotes, display_range) {
				// a single quote
				var quote = "";

				// check to see if the max value for our display range is greater than the number of quotes we have
				if ( display_range.max > quotes.length )
					display_range.max = quotes.length;
				else {
					createLoadButton();
				}


				for ( var i = display_range.min; i < display_range.max; i++ )
				{
					quote = quotes[i];

						// create the li to hold our blockquote
						var li = document.createElement("li");

						// create an anchor tag to link to twitter
						var twitterLink = document.createElement("a");
						twitterLink.setAttribute("href", "https://twitter.com/intent/tweet?text=" + quote);
						twitterLink.setAttribute("target", "_blank");

						// create an i tag for our font awesome twitter icon
						var italic = document.createElement("i");
						italic.setAttribute("class", "fa fa-twitter");

						// create the blockquote to hold our quote
						var blockquote = document.createElement("blockquote");

						// create a text node to store the quote
						var quote_text_node = document.createTextNode(quote);

						twitterLink.appendChild(italic);
						blockquote.appendChild(twitterLink);
						blockquote.appendChild(quote_text_node);
						
						li.appendChild(blockquote);
						ul.appendChild(li);
					} 

					display_range.max += 10;
					display_range.min = i;
					console.log(display_range)
				}

			// empties the contents of our ul
			function empty_list(ul) {
				
				var quote_nodes = document.querySelectorAll("ul li");

				for ( var i = 0; i < quote_nodes.length; i++ )
					ul.removeChild(quote_nodes[i]); 

			}

			// reset the page
			function reset() {

				display_range.max = 10;
				display_range.min = 0;

				ul = document.getElementById("quotes");
				button = document.getElementById("loadBTN");

				if ( ul )
					empty_list(ul);

				if ( button )
				{
					document.getElementsByTagName("body")[0].removeChild(button);
				}
			}

			// create a load more button
			function createLoadButton() {

				if ( ! document.getElementById("loadBTN") )
				{
					button = document.createElement("button");
					button.setAttribute("id", "loadBTN");
					textNode = document.createTextNode("Load More Quotes");
					button.appendChild(textNode);
					button.addEventListener("click", function(){
						display_quotes(document.getElementById("quotes"), quotes, display_range);
					});
					document.getElementsByTagName("body")[0].appendChild(button);
				}
			}

			window.onload = function() {
				reset();

				randomQuote();
			}

			document.getElementById("randomBTN").onclick = function() {
				
				reset();

				randomQuote();
			}	


			// check if the query form has been submitted
			form.onsubmit = function(event) {

				reset();

				// our response from our api request
				var successfulResponse = false;

				// we want to handle the request
				event.preventDefault();

				// grab the text from the query input box
				query_text = document.getElementById("query_text").value;

				// find checked radio
				query_data.searchtype = find_type();

				// store the query url
				query_url = construct_query_url(query_text, query_data.searchtype);

				// the response from our api request
				make_api_request(query_url);
			}