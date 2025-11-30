import logging

logger = logging.getLogger(__name__)

class GraphQLErrorMiddleware:
    """Middleware pour logger les erreurs GraphQL"""
    
    def resolve(self, next, root, info, **args):
        try:
            return next(root, info, **args)
        except Exception as e:
            logger.error(f"GraphQL Error: {str(e)}", exc_info=True)
            raise

