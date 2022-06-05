export const load = (htmlUrl, cssUrl, handler = (context) => void/* void or reset function */) => {
    /**
     * 1. dispatch "reset" event throught context
     * 2. reset context
     * 3. insert css link
     * 4. load html, insert html
     * 
     * context is a generic custom element class wrapper that extends 
     * html element and has method to call this load function.
     * it should dispatch event for every lifecycle method call, change.
     */
}