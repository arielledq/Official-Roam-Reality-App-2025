from django.core.files import File
from configuration.utils import ConfigKey

# TEST = ConfigKey(
#     value=1,
#     verbose_name='Test configuration value',
#     validation_function=lambda key, value: isinstance(value, int) and value > 0
# )
#
# TEST_NOT_FILE = ConfigKey(
#     value=1,
#     verbose_name='Test configuration value',
#     validation_function=lambda key, value: not isinstance(value, File)
# )
#
#
# TEST2 = 45
#
# TEST3 = "hola que tal"

LIMIT_USER_POINT_GIFT = ConfigKey(
    value=10000,
    verbose_name='Limit first users points gift',
    validation_function=lambda key, value: isinstance(value, int) and value > 0
)
NUMBER_USER_POINT_GIFT = ConfigKey(
    value=0,
    verbose_name='Current number of users that receive the points gift',
)
POINTS_GIFT = ConfigKey(
    value=25,
    verbose_name='Points given away',
)

SCOREBOARD_EXCLUDED_USER_IDS = ConfigKey(
    value=[],
    verbose_name='Scoreboard excluded user ids',
)
















# don't touch this
from configuration.utils import setup_configs_hooks
setup_configs_hooks()
