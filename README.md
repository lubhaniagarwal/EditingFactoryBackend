This is a simple application where user can login,register , logout and even have option for forgot password.

======REGISTER/SIGNUP====== 
It is a get route /register.
user can register in the website by using their Email id and password when successfully registered ,user will be loggin into the website. 
Used passport to authenticate users.

======LOGIN=====
It is a get route /login.
If a user wants to login, he/she will have to enter his/her email Id and password.

=====LOGOUT===== 
to logout ,route is /logout.
if user wants to logout, he /she renders to /logout and session will be terminated.

======FORGET PASSWORD====== 
It is get route /forgot .
when user clicks the link for forgot password. 
He/She will be directed to new page asking for his/her mail id.
An Email will be send with special token that expires after some mentioned time. 
That token link will direct the person to new page where He/She can reset his/her password. 
when password is successfully updated ,person will be logged in into the website. 
//Done using NodeMailer
