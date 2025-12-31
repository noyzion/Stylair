import { CognitoUser } from 'amazon-cognito-identity-js';
import { userPool } from './cognito';

export const getCurrentUser = () : CognitoUser | null => {
    return userPool.getCurrentUser();
};

export const getUserName = async (): Promise<string | null> => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return null; // או throw error - תלוי מה אתה מעדיף
    }

    return new Promise((resolve) => {
        currentUser.getSession((err: any, session: any) => {
            if (err || !session) {
                resolve(null);
                return;
            }

            currentUser.getUserAttributes((err: any, attributes: any) => {
                if (err || !attributes) {
                    resolve(null);
                    return;
                }

                const nameAttr = attributes.find((attr: any) => 
                    attr.Name === 'name' || attr.Name === 'given_name'
                );
                resolve(nameAttr?.Value || null);
            });
        });
    });
};

export const isAuthenticated = async (): Promise<boolean> => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return false;
    }

    return new Promise((resolve) => {
        currentUser.getSession((err: any, session: any) => {
            if (err || !session || !session.isValid()) {
                resolve(false);
                return;
            }
            resolve(true);
        });
    });
};

export const logout = async () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return;
    }
    currentUser.signOut();
};

/// <summary>
/// Gets the JWT token from the current Cognito session
/// This token is used to authenticate API requests
/// </summary>
export const getJwtToken = async (): Promise<string | null> => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        return null;
    }

    return new Promise((resolve) => {
        currentUser.getSession((err: any, session: any) => {
            if (err || !session || !session.isValid()) {
                resolve(null);
                return;
            }
            
            // Get the ID token (contains user claims like email, sub, etc.)
            const idToken = session.getIdToken();
            const jwtToken = idToken.getJwtToken();
            resolve(jwtToken);
        });
    });
};