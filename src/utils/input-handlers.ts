
export const handleStringChange = (component) => (key, event, { value }) => {
    component.setState({ [key]: value })
};