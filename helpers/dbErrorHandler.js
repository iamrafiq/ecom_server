exports.errorHandler = error =>{
    // let message ="";
    
    // if (error.code ){
    //     switch (error.code){
    //         case 11000:
    //             if (error.keyValue.email != null){
    //                 message = `Duplicate email address ${error.keyValue.email}, already exists!`;
    //             }
    //             if (error.keyValue.name != null){
    //                 message = `Duplicate ${error.keyValue.name}, already exists!`;
    //             }
    //             break;
    //         default:
    //             message = "Something went wrong";
    //     }
    // }

    return JSON.stringify(error);
}