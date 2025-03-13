const makeRequest = async (url, options = {}) => {
    const controller = new AbortController();
    const signal = controller.signal;
  
    try {
      const response = await fetch(url, { ...options, signal });
  
      if (!response.ok) throw new Error("Network response was not ok");
  
      const data = await response.json();
      return { data, abort: () => controller.abort() };
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request aborted");
      } else {
        throw new Error("Unknown error occured");
      }
    }
  };

export { makeRequest }