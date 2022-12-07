export const page1 =
	`<HTML>
<HEAD>
<TITLE>Your Title Here</TITLE>
</HEAD>
<BODY BGCOLOR="FFFFFF">
<CENTER><IMG SRC="clouds.jpg" ALIGN="BOTTOM"> </CENTER>
<HR>
<a href="http://somegreatsite.com">Link Name</a>
is a link to another nifty site
<H1>This is a Header</H1>
<H2>This is a Medium Header</H2>
Send me mail at <a href="mailto:support@yourcompany.com">
support@yourcompany.com</a>.
<P> This is a new paragraph!</P>
<P> <B>This is a new paragraph!</B></P>
<BR> <B><I>This is a new sentence without a paragraph break, in bold italics.</I></B>
<HR>
</BODY>
</HTML>
`

export const page2 =
	`<HTML>
<HEAD>
<TITLE>webpage1</TITLE>
</HEAD>
<BODY BGCOLOR="FFFFFf" LINK="006666" ALINK="8B4513" VLINK="006666">
<TABLE WIDTH="75%" ALIGN="center">
<TR>
<TD>
<DIV ALIGN="center"><H1>STARTING . . . </H1></DIV>
	
	
<DIV ALIGN="justify"><P>There are lots of ways to create web pages using already coded programmes. These lessons will teach you how to use the underlying HyperText Markup Language -  HTML. 
<BR>
<P>HTML isn't computer code, but is a language that uses US English to enable texts (words, images, sounds) to be inserted and formatting such as colo(u)r and centre/ering to be written in. The process is fairly simple; the main difficulties often lie in small mistakes - if you slip up while word processing your reader may pick up your typos, but the page will still be legible. However, if your HTML is inaccurate the page may not appear - writing web pages is, at the least, very good practice for proof reading!</P>
	
<P>Learning HTML will enable you to:
<UL>
<LI>create your own simple pages
<LI>read and appreciate pages created by others
<LI>develop an understanding of the creative and literary implications of web-texts
<LI>have the confidence to branch out into more complex web design 
</UL></P>
	
<H4>EXERCISE</H4>
	
<P>Write a simple web page.</P>
	
<P>Save a file as 'first.html' (ie. call the file anything at all) It's useful if you start a folder - just as you would for word-processing - and call it something like WEBPAGES, and put your first.html file in the folder.
	
<P>NOW - open your browser.<BR>
On Netscape the process is: <BR>  
Top menu; FILE\ OPEN PAGE\ CHOOSE FILE<BR> 
Click on your WEBPAGES folder\ FIRST file<BR>
Click 'open' and your page should appear.
<P>On Internet Explorer: <BR>
Top menu; FILE\ OPEN\ BROWSE <BR> 
Click on your WEBPAGES folder\ FIRST file<BR>
Click 'open' and your page should appear.<BR>
	
	
<P>
Make another page. Call it somethingdifferent.html and place it in the same WEBPAGES folder as detailed above.
<P>start formatting in <A HREF="webpage2.html">lesson two</A>
<BR><A HREF="col3.html">back to wws index</A> </P>
</P>
</P>
</P>
</P>
</P>

</DIV>
	
	
</TD>
</TR>
</TABLE>
</BODY>
</HTML>	
`

export const page3 =
	`<html>
<section id="embedded">
<header><h1>Embedded content</h1></header>
<article id="embedded__images">
<header><h2>Images</h2></header>
<div>
<h3>No <code>&lt;figure&gt;</code> element</h3>
<p><img src="http://placekitten.com/480/480" alt="Image alt text"></p>
<h3>Wrapped in a <code>&lt;figure&gt;</code> element, no <code>&lt;figcaption&gt;</code></h3>
<figure><img src="http://placekitten.com/420/420" alt="Image alt text"></figure>
<h3>Wrapped in a <code>&lt;figure&gt;</code> element, with a <code>&lt;figcaption&gt;</code></h3>
<figure>
<img src="http://placekitten.com/420/420" alt="Image alt text">
<figcaption>Here is a caption for this image.</figcaption>
</figure>
</div>
<footer><p><a href="#top">[Top]</a></p></footer>
</article>
<article id="embedded__audio">
<header><h2>Audio</h2></header>
<div><audio controls="">audio</audio></div>
<footer><p><a href="#top">[Top]</a></p></footer>
</article>
<article id="embedded__video">
<header><h2>Video</h2></header>
<div><video controls="">video</video></div>
<footer><p><a href="#top">[Top]</a></p></footer>
</article>
<article id="embedded__canvas">
<header><h2>Canvas</h2></header>
<div><canvas>canvas</canvas></div>
<footer><p><a href="#top">[Top]</a></p></footer>
</article>
<article id="embedded__meter">
<header><h2>Meter</h2></header>
<div><meter value="2" min="0" max="10">2 out of 10</meter></div>
<footer><p><a href="#top">[Top]</a></p></footer>
</article>
<article id="embedded__progress">
<header><h2>Progress</h2></header>
<div><progress>progress</progress></div>
<footer><p><a href="#top">[Top]</a></p></footer>
</article>
<article id="embedded__svg">
<header><h2>Inline SVG</h2></header>
<div><svg width="100px" height="100px"><circle cx="100" cy="100" r="100" fill="#1fa3ec"></circle></svg></div>
<footer><p><a href="#top">[Top]</a></p></footer>
</article>
<article id="embedded__iframe">
<header><h2>IFrame</h2></header>
<div><iframe src="index.html" height="300"></iframe></div>
<footer><p><a href="#top">[Top]</a></p></footer>
</article>
</section>
</html>
`