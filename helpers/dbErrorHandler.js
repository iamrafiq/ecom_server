exports.errorHandler = error =>{
    let message ="";
    
    if (error.code ){
        switch (error.code){
            case 11000:
                break;
            default:
                message = "Something went wrong";
        }
    }
}