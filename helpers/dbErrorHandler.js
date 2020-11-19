exports.errorHandler = error =>{
    let message ="";
    
    if (error && error.code ){
        switch (error.code){
            case 11000:
                if (error.keyValue.userId != null){
                    message = `${error.keyValue.userId}, already exists!`;
                }
                // if (error.keyValue.name != null){
                //     message = `Duplicate ${error.keyValue.name}, already exists!`;
                // }
                break;
            default:
                message = JSON.stringify(error);
        }
    }

    return message;
}