let components = {}
<% _.forEach(options.components, function(component, key) { %>components['<%=key%>'] = () => import('<%=component%>'); <% }); %>
export default {
  components
}
