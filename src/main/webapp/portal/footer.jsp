<div id="footer">
	<div class="banner">
	 	<div id="contentFooter">
	 		<div id="footerLinks">
	 			<div id="wiseLinks">
	 				<ul>
						<li class="first"><a href="${contextPath}/legacy/join"><spring:message code="footer.createAccount" /></a></li>
						<li><a href="${contextPath}/legacy/pages/wise-advantage.html"><spring:message code="footer.wiseAdvantage" /></a></li>
						<li><a href="${contextPath}/legacy/pages/features.html"><spring:message code="footer.wiseFeatures" /></a></li>
						<li><a href="${contextPath}/legacy/pages/teacher-tools.html"><spring:message code="footer.teacherTools" /></a></li>
						<li><a href="${contextPath}/legacy/pages/teacherfaq.html"><spring:message code="footer.faq" /></a></li>
						<li><a href="${contextPath}/legacy/pages/gettingstarted.html"><spring:message code="footer.gettingStarted" /></a></li>
						<li><a href="${contextPath}/legacy/pages/privacy-terms.html"><spring:message code="footer.privacyAndUse" /></a></li>
						<li class="last"><a href="${contextPath}/legacy/contact/contactwise.html"><spring:message code="footer.contact" /></a></li>
						<!-- TODO: uncomment me when credits page is ready <li class="last"><a href="credits.html"><spring:message code="footer.credits" /></a></li> -->
					</ul>
	 			</div>
				<div id="wiseOpenSource">
					<spring:message code="footer.poweredBy" /> <a href="https://github.com/WISE-Community/WISE" target="_blank"><spring:message code="footer.wiseOpenSourceTechnology" /></a>.
				</div>
				<div style="clear:both; padding:0;"></div>
	 		</div>
	 		<div>
	 			<div id="footerLogos">
					<a href="http://www.nsf.gov" title="<spring:message code="footer.link_nsf" />" target="_blank">
						<img src="${contextPath}/<spring:theme code="nsf_logo"/>" alt="<spring:message code="footer.link_nsf" />" />
					</a>
					<a href="http://berkeley.edu" title="<spring:message code="footer.link_ucb" />" target="_blank">
						<img src="${contextPath}/<spring:theme code="ucb_logo"/>" alt="<spring:message code="footer.link_ucb" />" />
					</a>
					<a href="http://concord.org" title="<spring:message code="footer.link_concord" />" target="_blank">
						<img src="${contextPath}/<spring:theme code="concord_logo"/>" alt="<spring:message code="footer.link_concord" />" />
					</a>
					<img src="${contextPath}/<spring:theme code="sail_logo"/>" alt="<spring:message code="footer.link_sail" />" />
					<a href="http://www.telscenter.org/" title="<spring:message code="footer.link_tels" />" target="_blank">
						<img src="${contextPath}/<spring:theme code="tels_logo_small"/>" alt="<spring:message code="footer.link_tels" />" />
					</a>
				</div>
				<div id="footerText">
					<p><spring:message code="footer.nsfSupport" /></p>
					<p>
					<c:if test="${wiseVersion != null}">
						WISE ${wiseVersion}
					</c:if>
					&copy; <spring:message code="legalCopyright" />
					</p>
				</div>
				<div style="clear:both; padding:0;"></div>
				<%@ include file="analytics.jsp" %>
	 		</div>
		</div>
	<!-- End of contentFooter -->
	</div> 	<!-- End of banner -->
</div>	<!-- End of footer -->
