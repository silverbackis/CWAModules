let components = {}
<% _.forEach(options.components, function(component, key) {
  if(
    !component || !options.componentEnabledVoter(options, { key, component })
  ) { return; }
%>
components['<%= key %>'] = () => import('<%= component %>');<% }); %>
export default { components }
