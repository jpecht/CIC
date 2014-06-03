<!--- Listing of Counties for Selected State --->

<CFPARAM NAME="statecode" DEFAULT="">

        <CFQUERY NAME="getstate" datasource="naco_cic">
		SELECT *
		FROM States (NOLOCK)
		WHERE Statecode =  '#statecode#'
		</CFQUERY> 
			
		<CFQUERY NAME="getcounties" datasource="naco_cic">
		SELECT FIPS,   County_Name, State, county_seat, Member_Status,  Org_Type,
		Population_2010, Total_Square_Miles, founded,  board_size, Gov_Type
		FROM  County_Data  (NOLOCK)
		WHERE State='#statecode#' and Org_Type in ('County', 'Independent City', 'County W/o Govt Structure', 'Geographical Census Area') 
		ORDER BY Org_Type
		</CFQUERY> 
     

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
<head>
<title>Find a County</title>
<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-1">

<link href='http://fonts.googleapis.com/css?family=Roboto:400' rel='stylesheet' type='text/css'>
<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
<link rel="stylesheet" href="http://nacocic.naco.org/css/main.css">
<style>
#responseContent{
	background-color: rgba(255,255,255,0);
}
</style>

</head>
<body id="responseContent">
<div class="container-fluid">


<CFOUTPUT QUERY="getcounties" group="org_type">
<h2 style="text-align:left; padding-bottom:10px;">#getstate.StateName#</h2>

<CFIF org_type NEQ 'County'>
               
                <TABLE WIDTH="95%" BORDER="1" cellspacing="0" cellpadding="0">
                <TR><TD>#org_type#</TD>
                <TD align="right">2010 Population</TD>
                <TD align="right">Square Miles</TD></TR>
                    <CFOUTPUT>
                    <TR>
                    <TD>#County_Name#</TD>
                    <TD align="right">#NumberFormat(Population_2010)#</TD><TD align="right">#NumberFormat(Square_Miles)#</TD></TR>
                    </CFOUTPUT>
                </TABLE>
               
 <CFELSE>
    			<TABLE class="table table-striped table-condensed">
				<TR>
                    <TH>
                    <CFIF #state# EQ 'LA'>Parish</CFIF>
                    <CFIF #state# EQ 'AK'>Borough</CFIF>
                    <CFIF #state# NEQ 'LA' AND #state# NEQ 'AK' >County</CFIF>
                    </TH>
					<TH>NACo<BR>Member</TH>
					<TH>2010<BR>Population</a></TH>
					<TH>Square<BR>Miles</TH> 
					<TH>County Seat</TH>
					<TH>Board<BR>Size</TH>
					<TH>Founded</TH>
					</TR>
		
		     <CFOUTPUT>
				<TR>
				<TD><a id="#FIPS#" href="http://www.uscounties.org/cffiles_web/counties/county.cfm?id=#FIPS#" >#County_Name#</a>
				 <CFIF Gov_Type EQ  "Consolidated">*</CFIF>
                </TD>
				<TD ALIGN="CENTER"><CFIF Member_Status EQ  'Active'><IMG SRC="images/check2.gif"><CFELSE>&nbsp;</CFIF></TD>
				<TD ALIGN="RIGHT"><CFIF Population_2010 GT 0>#NumberFormat(Population_2010)#<CFELSE><em>N/A</em></CFIF> </TD>
				<TD ALIGN="RIGHT"><CFIF Total_Square_Miles GT 0>#NumberFormat(Total_Square_Miles)#  <CFELSE><em>N/A</em></CFIF> </TD> 
				<TD ALIGN="LEFT"> #county_seat#&nbsp;</TD> 
				<TD align="right"> #board_size#&nbsp;</TD> 
				<TD ALIGN="CENTER">#founded#&nbsp;</TD>
				</TR>
		     </CFOUTPUT> 
				</TABLE> 
  
</CFIF> 

</CFOUTPUT> 



</div>

</body>
</html>