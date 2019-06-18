<?xml version="1.0"?>
<!--
    Transform an XML Validation Report into presentable HTML.
    Author: Maksim Bezrukov
    Version: 1.0
-->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

    <xsl:output indent="yes" method="html"/>

    <!-- Parameter to select a full HTML document (true) or a fragment within div (false) -->
    <xsl:param name="isFullHTML" select="'true'"/>
    <!-- Parameter to show parser type -->
    <xsl:param name="parserType"/>
    <!-- Prameter to set the base path to the Wiki instance -->
    <xsl:param name="wikiPath"
               select="'https://github.com/veraPDF/veraPDF-validation-profiles/wiki/'"/>
    <xsl:strip-space elements="*"/>

    <!-- HTML header and body wrapper -->
    <xsl:template match="/">
        <xsl:if test="$isFullHTML='true'">
            <html>
                <head>
                    <title>Validation Report</title>
                </head>
                <body>
                    <style>
                        <xsl:text>body{font-family: Consolas;}</xsl:text>
                    </style>
                    <h1 align="left">
                        <strong>
                            <b>Validation Report</b>
                        </strong>
                    </h1>
                    <xsl:apply-templates/>
                </body>
            </html>
        </xsl:if>
        <xsl:if test="$isFullHTML='false'">
            <xsl:apply-templates/>
        </xsl:if>
    </xsl:template>

    <!-- Validation Report header -->
    <xsl:template match="report">
        <div>
            <style>
                div {
                font-family: sans-serif;
                }
                .invalid {
                color: red;
                font-weight: bold;
                }
                .valid {
                color: green;
                font-weight: bold;
                }
                th {
                text-align: left;
                }
                .policy th, .policy td {
                padding: 5px;
                }
            </style>
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
            <script type="text/javascript">
                if(typeof $ === 'function'){
                $(document).ready(function(){
                $(".hideable").hide();
                $(".hide-tr").show();
                $(".hide-tr").click(function(){
                $("." + $(this).attr("data-target")).toggle();
                var prevText = $(this).text();
                $(this).text($(this).attr('data-translation-toggle'));
                $(this).attr('data-translation-toggle', prevText)
                return false;
                });
                });
                }
            </script>

            <xsl:variable name="validClass">
                <xsl:choose>
                    <xsl:when
                            test="/report/jobs/job/validationReport/@isCompliant = 'true'">
                        <xsl:value-of select="'valid'"/>
                    </xsl:when>
                    <xsl:otherwise>
                        <xsl:value-of select="'invalid'"/>
                    </xsl:otherwise>
                </xsl:choose>
            </xsl:variable>
            <!-- General information -->
            <table border="0" id="table1">
                <tr>
                    <td width="200">
                        <b>File:</b>
                    </td>
                    <td>
                        <xsl:value-of select="/report/jobs/job/item/name"/>
                    </td>
                </tr>
                <xsl:if test="/report/jobs/job/validationReport/@profileName">
                    <tr>
                        <td width="200">
                            <b>Validation Profile:</b>
                        </td>
                        <td>
                            <xsl:value-of
                                    select="/report/jobs/job/validationReport/@profileName"/>
                        </td>
                    </tr>
                </xsl:if>
                <xsl:if test="/report/jobs/job/validationReport/@isCompliant">
                    <tr>
                        <td width="200" class="{$validClass}">
                            PDF/A compliance:
                        </td>
                        <td class="{$validClass}">
                            <xsl:if test="/report/jobs/job/validationReport/@isCompliant = 'true'">
                                Passed
                            </xsl:if>
                            <xsl:if test="/report/jobs/job/validationReport/@isCompliant = 'false'">
                                Failed
                            </xsl:if>
                        </td>
                    </tr>
                </xsl:if>
                <xsl:if test="/report/jobs/job/taskResult/exceptionMessage">
                    <tr>
                        <td width="200" class="invalid">
                            Error:
                        </td>
                        <td class="invalid">
                            <xsl:value-of
                                    select="/report/jobs/job/taskResult/exceptionMessage"/>
                        </td>
                    </tr>
                </xsl:if>
                <xsl:if test="/report/jobs/job/policyReport">
                    <tr>
                        <xsl:choose>
                            <xsl:when
                                    test="/report/jobs/job/policyReport/@failedChecks > 0">
                                <td class="invalid">Policy compliance:</td>
                                <td class="invalid">Failed</td>
                            </xsl:when>
                            <xsl:otherwise>
                                <td class="valid">Policy compliance:</td>
                                <td class="valid">Passed</td>
                            </xsl:otherwise>
                        </xsl:choose>
                    </tr>
                </xsl:if>
            </table>

            <h2>Statistics</h2>
            <table border="0" id="table2">
                <tr>
                    <td width="250">
                        <b>Version:</b>
                    </td>
                    <td>
                        <xsl:value-of
                                select="/report/buildInformation/releaseDetails[@id='gui']/@version"/>
                    </td>
                </tr>
                <xsl:if test="$parserType">
                    <tr>
                        <td width="250">
                            <b>Parser:</b>
                        </td>
                        <td>
                            <xsl:value-of
                                    select="$parserType"/>
                        </td>
                    </tr>
                </xsl:if>
                <tr>
                    <td width="250">
                        <b>Build Date:</b>
                    </td>
                    <td>
                        <xsl:value-of
                                select="/report/buildInformation/releaseDetails[@id='gui']/@buildDate"/>
                    </td>
                </tr>
                <tr>
                    <td width="250">
                        <b>Processing time:</b>
                    </td>
                    <td>
                        <xsl:value-of select="/report/jobs/job/duration"/>
                    </td>
                </tr>
                <xsl:if test="/report/jobs/job/validationReport/details/@passedRules or /report/jobs/job/validationReport/details/@failedRules">
                    <tr>
                        <td width="250">
                            <b>Total rules in Profile:</b>
                        </td>
                        <td>
                            <xsl:value-of
                                    select="/report/jobs/job/validationReport/details/@passedRules + /report/jobs/job/validationReport/details/@failedRules"/>
                        </td>
                    </tr>
                </xsl:if>
                <xsl:if test="/report/jobs/job/validationReport/details/@passedChecks">
                    <tr>
                        <td width="250">
                            <b>Passed Checks:</b>
                        </td>
                        <td>
                            <xsl:value-of
                                    select="/report/jobs/job/validationReport/details/@passedChecks"/>
                        </td>
                    </tr>
                </xsl:if>
                <xsl:if test="/report/jobs/job/validationReport/details/@failedChecks">
                    <tr>
                        <td width="250">
                            <b>Failed Checks:</b>
                        </td>
                        <td>
                            <xsl:value-of
                                    select="/report/jobs/job/validationReport/details/@failedChecks"/>
                        </td>
                    </tr>
                </xsl:if>
                <xsl:if test="/report/jobs/job/policyReport">
                    <tr>
                        <td width="250">
                            <b>Failed Policy Checks:</b>
                        </td>
                        <td>
                            <xsl:value-of
                                    select="/report/jobs/job/policyReport/@failedChecks"/>
                        </td>
                    </tr>
                </xsl:if>
                <xsl:apply-templates
                        select="/report/jobs/job/metadataRepairReport/@status"/>
                <xsl:apply-templates
                        select="/report/jobs/job/metadataRepairReport/@fixCount"/>
            </table>
            <xsl:if test="/report/jobs/job/metadataRepairReport/fixes/fix">
                <h2>Metadata fixes information</h2>

                <table border="0" id="table4">
                    <tr style="BACKGROUND: #bcbad6">
                        <td width="800">
                            <b>Fixes</b>
                        </td>
                        <td width="50">
                            <a id="lable{fixesId}" href="#"
                               style="display: none;"
                               class="hide-tr"
                               data-target="hide{fixesId}"
                               data-translation-toggle="Hide">Show
                            </a>
                        </td>
                    </tr>

                    <xsl:apply-templates
                            select="/report/jobs/job/metadataRepairReport/fixes/fix"/>

                </table>
            </xsl:if>

            <xsl:if test="/report/jobs/job/metadataRepairReport/errors/error">
                <h2>Metadata fixer errors information</h2>

                <table border="0" id="table5">
                    <tr style="BACKGROUND: #bcbad6">
                        <td width="800">
                            <b>Fixes</b>
                        </td>
                        <td width="50">
                            <a id="lable{fixererrorsId}" href="#"
                               style="display: none;"
                               class="hide-tr"
                               data-target="hide{fixererrorsId}"
                               data-translation-toggle="Hide">Show
                            </a>
                        </td>
                    </tr>

                    <xsl:apply-templates
                            select="/report/jobs/job/metadataFixesReport/error"/>

                </table>
            </xsl:if>

            <xsl:if test="/report/jobs/job/validationReport/details/rule">
                <h2>Validation information</h2>

                <table border="0" id="table3">
                    <tr style="BACKGROUND: #bcbad6">
                        <td width="800">
                            <b>Rule</b>
                        </td>
                        <td width="50">
                            <b>Status</b>
                        </td>
                    </tr>
                    <xsl:apply-templates
                            select="/report/jobs/job/validationReport/details/rule"/>
                </table>
            </xsl:if>

            <xsl:if test="/report/jobs/job/policyReport">
                <xsl:apply-templates select="/report/jobs/job/policyReport"/>
            </xsl:if>

        </div>
        <xsl:if test="/report/jobs/job/featuresReport">
            <h2>Features information</h2>

            <table border="0" id="table4">
                <tr style="BACKGROUND: #bcbad6">
                    <td width="800">
                        <b>Feature</b>
                    </td>
                </tr>
                <xsl:apply-templates
                        select="/report/jobs/job/featuresReport/*"/>
            </table>
        </xsl:if>
    </xsl:template>


    <xsl:template match="/report/jobs/job/metadataRepairReport/@status">
        <tr>
            <td width="250">
                <b>Metadata Fixes Status:</b>
            </td>
            <td>
                <xsl:value-of
                        select="/report/jobs/job/metadataRepairReport/@status"/>
            </td>
        </tr>
    </xsl:template>

    <xsl:template match="/report/jobs/job/metadataRepairReport/@fixCount">
        <tr>
            <td width="250">
                <b>Completed Metadata Fixes:</b>
            </td>
            <td>
                <xsl:value-of
                        select="/report/jobs/job/metadataRepairReport/@fixCount"/>
            </td>
        </tr>
    </xsl:template>

    <!-- Validation Information -->
    <xsl:template match="/report/jobs/job/validationReport/details/rule">

        <xsl:param name="idWithDots" select="concat(@clause,'t',@testNumber)"/>
        <xsl:param name="id" select="translate($idWithDots, '.', '_')"/>

        <xsl:variable name="part-1-rules">
            <xsl:choose>
                <xsl:when
                        test="'/' = substring($wikiPath, string-length($wikiPath))">
                    <xsl:value-of
                            select="concat($wikiPath, 'PDFA-Part-1-rules')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of
                            select="concat($wikiPath, '/PDFA-Part-1-rules')"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:variable name="part-2-rules">
            <xsl:choose>
                <xsl:when
                        test="'/' = substring($wikiPath, string-length($wikiPath))">
                    <xsl:value-of
                            select="concat($wikiPath, 'PDFA-Parts-2-and-3-rules')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of
                            select="concat($wikiPath, '/PDFA-Parts-2-and-3-rules')"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>

        <xsl:variable name="tempWikiLink">
            <xsl:choose>
                <xsl:when test="starts-with(@specification, 'ISO 19005-1')">
                    <xsl:value-of select="$part-1-rules"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$part-2-rules"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="wikiLink">
            <xsl:choose>
                <xsl:when test="not(starts-with($tempWikiLink, 'http'))">
                    <xsl:value-of select="concat($tempWikiLink, '.html')"/>
                </xsl:when>
                <xsl:otherwise>
                    <xsl:value-of select="$tempWikiLink"/>
                </xsl:otherwise>
            </xsl:choose>
        </xsl:variable>
        <xsl:variable name="ruleLink"
                      select="concat($wikiLink, '#rule-', translate(@clause, '.', ''), '-', @testNumber)"/>

        <tr style="BACKGROUND: #dcdaf6">
            <td width="800">
                <a href="{$ruleLink}">
                    Specification:
                    <xsl:value-of select="@specification"/>,
                    Clause:
                    <xsl:value-of select="@clause"/>,
                    Test number:
                    <xsl:value-of select="@testNumber"/>
                </a>
            </td>
            <td/>
        </tr>
        <tr style="BACKGROUND: #dcdaf6">
            <td width="800">
                <xsl:value-of
                        select="description"/>
            </td>
            <td width="50">
                <b>
                    <xsl:if test="@status = 'passed'">
                        <font color="green">
                            <b>Passed</b>
                        </font>
                    </xsl:if>
                    <xsl:if test="@status = 'failed'">
                        <font color="red">
                            <b>Failed</b>
                        </font>
                    </xsl:if>
                </b>
            </td>
        </tr>
        <xsl:if test="@failedChecks > 0">
            <tr style="BACKGROUND: #dcdaf6">
                <td width="800">
                    <xsl:value-of select="@failedChecks"/> occurrences
                </td>
                <td width="50">
                    <xsl:if test="@status = 'failed'">
                        <a id="lable{$id}" href="#" style="display: none;"
                           class="hide-tr"
                           data-target="hide{$id}"
                           data-translation-toggle="Hide">Show
                        </a>
                    </xsl:if>
                </td>
            </tr>
            <tr style="BACKGROUND: #eceaf6" class="hideable hide{$id}">
                <td width="800" style="word-break: break-all">
                    <xsl:value-of select="object"/>
                </td>
                <td/>
            </tr>
            <tr style="BACKGROUND: #eceaf6" class="hideable hide{$id}">
                <td width="800" style="word-break: break-all">
                    <xsl:value-of select="test"/>
                </td>
                <td/>
            </tr>
            <xsl:for-each select="check[@status = 'failed']">
                <tr class="hideable hide{$id}">
                    <td width="800" style="word-break: break-all">
                        <xsl:value-of select="context"/>
                    </td>
                </tr>
            </xsl:for-each>
        </xsl:if>

        <tr>
            <td>
                <br/>
            </td>
            <td>
                <br/>
            </td>
        </tr>

    </xsl:template>
    <!-- Features Information -->
    <xsl:template match="/report/jobs/job/featuresReport/*">

        <tr style="BACKGROUND: #dcdaf6">
            <td width="800">
                <a>
                    <xsl:choose>
                        <xsl:when test="local-name()='informationDict'">
                            Information dictionary
                        </xsl:when>
                        <xsl:when test="local-name()='documentResources'">
                            Document resources
                        </xsl:when>
                        <xsl:when test="local-name()='outlines'">
                            Outlines
                        </xsl:when>
                        <xsl:when test="local-name()='lowLevelInfo'">
                            Low level info
                        </xsl:when>
                        <xsl:when test="local-name()='metadata'">
                            Metadata
                        </xsl:when>
                        <xsl:when test="local-name()='signatures'">
                            Signatures
                        </xsl:when>
                        <xsl:when test="local-name()='embeddedFiles'">
                            Embedded files
                        </xsl:when>
                        <xsl:when test="local-name()='iccProfiles'">
                            ICC profiles
                        </xsl:when>
                        <xsl:when test="local-name()='outputIntents'">
                            Output intents
                        </xsl:when>
                        <xsl:when test="local-name()='annotations'">
                            Annotations
                        </xsl:when>
                        <xsl:when test="local-name()='pages'">
                            Pages
                        </xsl:when>
                        <xsl:when test="local-name()='errors'">
                            Errors
                        </xsl:when>
                    </xsl:choose>
                </a>
            </td>
        </tr>

    </xsl:template>
    <!-- Metadata fixes information -->
    <xsl:template match="/report/jobs/job/metadataRepairReport/fixes/fix">
        <tr class="hideable hide{fixesId}">
            <td width="800" style="word-break: break-all">
                <xsl:value-of select="."/>
            </td>
        </tr>
    </xsl:template>

    <!-- Metadata fixer errors information -->
    <xsl:template match="/report/jobs/job/metadataRepairReport/errors/error">
        <tr class="hideable hide{fixererrorsId}">
            <td width="800" style="word-break: break-all">
                <xsl:value-of select="."/>
            </td>
        </tr>
    </xsl:template>

    <xsl:template match="/report/jobs/job/policyReport">
        <h2>Policy information</h2>
        <table class="policy">
            <tr style="background: #bcbad6">
                <th class="le">Message</th>
                <th>Status</th>
                <th>Location</th>
            </tr>
            <xsl:for-each select="*/check">
                <xsl:variable name="validClass">
                    <xsl:choose>
                        <xsl:when test="@status = 'passed'">
                            <xsl:value-of select="'valid'"/>
                        </xsl:when>
                        <xsl:otherwise>
                            <xsl:value-of select="'invalid'"/>
                        </xsl:otherwise>
                    </xsl:choose>
                </xsl:variable>
                <tr style="background: #dcdaf6">
                    <td>
                        <xsl:value-of select="message"/>
                    </td>
                    <td class="{$validClass}">
                        <xsl:value-of select="@status"/>
                    </td>
                    <td>
                        <xsl:value-of select="@location"/>
                    </td>
                </tr>
            </xsl:for-each>
        </table>
    </xsl:template>

</xsl:stylesheet>
