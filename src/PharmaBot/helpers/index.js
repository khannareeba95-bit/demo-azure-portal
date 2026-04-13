export const capitalizeWord = (inputText) => {
    return inputText.split("_").map(word => word.slice(0, 1).toUpperCase() + word.slice(1)).join(" ")
}

export const baseURL = "https://5gp21pm1sa.execute-api.ap-south-1.amazonaws.com/demo/chatbot";
// https://5gp21pm1sa.execute-api.ap-south-1.amazonaws.com/demo/chatbot
export const handleQueryMessage = async (queryBody, messages, setMessages) => {


    let apiBody = {
        text: queryBody?.text,
        sessionId: queryBody?.sessionId,
        loggedInUser: queryBody?.loggedInUser,
        RDS: queryBody?.RDS,
        uuId: queryBody?.refrenceUuid
    }
    let responseType = "";
    let responseData = null;
    try {
        let data = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiBody),
        }).then(res => res.json());
        console.log(data.text)
        if (data.hasOwnProperty('errorMessage') || data.hasOwnProperty('message')) {
            let parsedText;
            try {
                parsedText = data.hasOwnProperty('errorMessage') ? JSON.parse(data?.errorMessage) : JSON.parse(data?.message);
            } catch {
                parsedText = data.hasOwnProperty('errorMessage') ? data?.errorMessage : data?.message;
            }
            const response = {
                response: parsedText,
                query: data?.query || undefined
            }
            return response;
        }
        responseType = data.hasOwnProperty('text') ? 'text' : 'table';
        responseData = data[responseType].replace(/NaN/ig, "null").replace(/None/ig, "null");
        console.log('first response', data);
        let parsedText;
        try {
            parsedText = JSON.parse(responseData);
        } catch {
            parsedText = responseData;
        }
        console.log('handleQueryMessage', parsedText, data?.query);
        const response = {
            response: parsedText,
            query: data?.query
        }
        return response;
    } catch (error) {
        throw new Error(error.message);
    }
    finally {
    }
}


export const submitFeedbackToAPI = async (feedbackData) => {
    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedbackData)
        })
        const data = await response.json()
        return data
    } catch (error) {
        console.error('API Error:', error)
        throw error
    }
}