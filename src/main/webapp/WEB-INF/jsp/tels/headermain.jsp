<div id="header">

	<div id="bannerArea1" class="banner">
		<c:if test="${pageContext.request.servletPath == '/WEB-INF/jsp/tels/index.jsp'}">
			<!-- show a link to WISE2 if this is the main homepage -->
			<div class="announce">
				<spring:htmlEscape defaultHtmlEscape="false">
					<spring:escapeBody htmlEscape="false">
						<spring:message code="headermain.newUrl" />
					</spring:escapeBody>
				</spring:htmlEscape>
			</div>
			<img class="announceIcon"
				src="/webapp/themes/tels/default/images/icons/marker.png"
				alt="announcement" />
		</c:if>

		<a id="name" href="/webapp/" title="WISE Homepage">WISE
		</a>

		<%@ include file="accountmenu.jsp"%>

	</div>
</div>