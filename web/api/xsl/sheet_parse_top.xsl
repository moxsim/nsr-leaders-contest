<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
  <xsl:template match="/response/sheet[1]">
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
		  <xsl:value-of select="substring(@r,1,1)" />
		  <!-- 
			Вот так надо, но это только в версии 2.0 работает
			<xsl:value-of select="replace(@r, '[0-9]', '')" />
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

</xsl:stylesheet>