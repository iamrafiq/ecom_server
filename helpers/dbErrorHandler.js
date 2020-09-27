exports.errorHandler = error =>{
    let message ="";
    
    if (error.code ){
        switch (error.code){
            case 11000:
                if (error.keyValue.email != null){
                    message = `Duplicate email address ${error.keyValue.email} already exists!`;
                }
                break;
            default:
                message = "Something went wrong";
        }
    }

    return message;
}