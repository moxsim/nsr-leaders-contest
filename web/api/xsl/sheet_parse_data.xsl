<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/worksheet/sheetData">
    <sheet>
      <xsl:apply-templates select="row/c"/>
    </sheet>
  </xsl:template>

  <xsl:template match="row/c">
	<cell>
		<row>
		  <xsl:value-of select="../@r" />
		</row>
		<col>
			<xsl:value-of select="@r" />

			<!-- Вызываем шаблон для удаления подстроки с конца строки -->
			<!--
			<xsl:call-template name="remove-substring">
				<xsl:with-param name="text" select="@r"/>
				<xsl:with-param name="substring" select="../@r"/>
			</xsl:call-template>
			-->
		</col>
		<val>
		  <xsl:value-of select="v" />
		</val>
		<type>
		  <xsl:value-of select="@t" />
		</type>
	</cell>
  </xsl:template>

  <!-- Шаблон для удаления подстроки с конца строки -->
  <xsl:template name="remove-substring">
    <xsl:param name="text"/>
    <xsl:param name="substring"/>
    <xsl:variable name="text-length" select="string-length($text)"/>
    <xsl:variable name="substring-length" select="string-length($substring)"/>
    <xsl:variable name="end-substring" select="substring($text, $text-length - $substring-length + 1)"/>
    <xsl:choose>
      <xsl:when test="$end-substring = $substring">
        <xsl:value-of select="substring($text, 1, $text-length - $substring-length)"/>
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="$text"/>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

</xsl:stylesheet>