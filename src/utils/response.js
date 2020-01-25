module.exports.error = (message, errors) => {
    return {
        message: message,
        errors: errors
    }
}

module.exports.success = (message, data) => {
    return {
        message: message,
        data: data
    }
}