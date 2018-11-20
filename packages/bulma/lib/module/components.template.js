let components = {}
<%
  for(const [ key, component ] of Object.entries(options.components)) {
    const isDisabled = !component || !options.componentEnabledVoter(options, { key, component })
    if (isDisabled) { continue }
%>components['<%=key%>'] = () => import('<%=component%>'); <% } %>

export default {
  components,
  methods: {
    componentName (component) {
      const componentEntity = this.getEntity(component)
      return componentEntity.componentName || componentEntity[ '@type' ]
    }
  }
}
