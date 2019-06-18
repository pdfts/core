$Vera = "..\..\..\..\verapdf\verapdf.bat"; # adjust to your system!!!
$CurrentLocation = (Get-Item -Path ".\").FullName + "\";

# print version to have atleast some output
& $Vera --version

Write "Validating all files is:" $CurrentLocation;

$Utf8NoBomEncoding = New-Object System.Text.UTF8Encoding $False
$xslt = New-Object System.Xml.Xsl.XslCompiledTransform;
$xslt.Load($CurrentLocation + "_validate.xsl");


Get-ChildItem $CurrentLocation -Filter *.pdf | 
Foreach-Object {
	Write ("-> validating: " + $_.Name)
	
	# prepare filenames
	$xmlFile = ($CurrentLocation + $_.Name.Replace(".pdf", ".validated.xml"));
	$htmlFile = ($CurrentLocation + $_.Name.Replace(".pdf", ".validated.html"));
	
	# run veraPDF
	$xml = & $Vera $_.Name --verbose;
	
	# write result (as UTF8) to file
	[IO.File]::WriteAllLines($xmlFile, $xml)
	
	# transform xsl and xml to html
	$xslt.Transform($xmlFile, $htmlFile);
}